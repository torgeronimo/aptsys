import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TenantInput } from '@/lib/schemas'
import { useAuth } from './useAuth'

async function hasActiveTenantInUnit(unitId: string, excludeTenantId?: string) {
  let query = supabase
    .from('tenants')
    .select('id')
    .eq('unit_id', unitId)
    .eq('status', 'active')

  if (excludeTenantId) query = query.neq('id', excludeTenantId)

  const { data, error } = await query
  if (error) throw error
  return (data?.length ?? 0) > 0
}

async function vacateUnitIfNoActiveTenant(unitId: string, excludeTenantId?: string) {
  const hasActive = await hasActiveTenantInUnit(unitId, excludeTenantId)
  if (!hasActive) {
    const { error } = await supabase.from('units').update({ status: 'vacant' }).eq('id', unitId)
    if (error) throw error
  }
}

export function useTenants(filters?: { buildingId?: string; status?: string }) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['tenants', filters, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('tenants')
        .select('*, units(unit_number, building_id, rent_amount, buildings(name))')
        .order('name')
      if (filters?.status) query = query.eq('status', filters.status as 'active' | 'inactive')
      const { data, error } = await query
      if (error) throw error
      // filter by buildingId client-side since it's nested
      if (filters?.buildingId) {
        return data.filter((t) => {
          const unit = t.units as { building_id: string } | null
          return unit?.building_id === filters.buildingId
        })
      }
      return data
    },
    enabled: !!user,
  })
}

export function useTenant(id: string) {
  return useQuery({
    queryKey: ['tenants', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*, units(unit_number, building_id, rent_amount, buildings(name, address))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useCreateTenant() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: TenantInput) => {
      if (input.status === 'active') {
        const unitOccupied = await hasActiveTenantInUnit(input.unit_id)
        if (unitOccupied) {
          throw new Error('This unit already has an active tenant.')
        }
      }

      const { data, error } = await supabase
        .from('tenants')
        .insert({
          name: input.name,
          phone: input.phone || null,
          email: input.email || null,
          unit_id: input.unit_id,
          move_in_date: input.move_in_date,
          move_out_date: input.move_out_date || null,
          status: input.status,
          owner_id: user!.id,
        })
        .select()
        .single()
      if (error) throw error

      if (input.status === 'active') {
        const { error: unitError } = await supabase.from('units').update({ status: 'occupied' }).eq('id', input.unit_id)
        if (unitError) throw unitError
      }

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useUpdateTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TenantInput }) => {
      const { data: existingTenant, error: fetchError } = await supabase
        .from('tenants')
        .select('unit_id, status')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError
      if (!existingTenant) throw new Error('Tenant not found.')

      const oldUnitId = existingTenant.unit_id
      const oldStatus = existingTenant.status
      const newUnitId = input.unit_id
      const newStatus = input.status

      if (newStatus === 'active') {
        const unitOccupied = await hasActiveTenantInUnit(newUnitId, id)
        if (unitOccupied) {
          throw new Error('Cannot activate tenant because this unit already has an active tenant.')
        }
      }

      const { data, error } = await supabase
        .from('tenants')
        .update({
          name: input.name,
          phone: input.phone || null,
          email: input.email || null,
          unit_id: newUnitId,
          move_in_date: input.move_in_date,
          move_out_date: input.move_out_date || null,
          status: newStatus,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error

      if (newStatus === 'active') {
        const { error: occupyError } = await supabase.from('units').update({ status: 'occupied' }).eq('id', newUnitId)
        if (occupyError) throw occupyError
      }

      if (oldStatus === 'active' && (oldUnitId !== newUnitId || newStatus === 'inactive')) {
        await vacateUnitIfNoActiveTenant(oldUnitId, id)
      }

      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}

export function useDeleteTenant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, unitId }: { id: string; unitId: string }) => {
      const { data: existingTenant, error: fetchError } = await supabase
        .from('tenants')
        .select('status')
        .eq('id', id)
        .single()
      if (fetchError) throw fetchError

      const { error } = await supabase.from('tenants').delete().eq('id', id)
      if (error) throw error

      if (existingTenant?.status === 'active') {
        await vacateUnitIfNoActiveTenant(unitId, id)
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}
