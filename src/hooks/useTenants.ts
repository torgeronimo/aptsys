import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TenantInput } from '@/lib/schemas'
import { useAuth } from './useAuth'

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
      // Mark unit as occupied
      await supabase.from('units').update({ status: 'occupied' }).eq('id', input.unit_id)
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
      const { data, error } = await supabase
        .from('tenants')
        .update({
          name: input.name,
          phone: input.phone || null,
          email: input.email || null,
          unit_id: input.unit_id,
          move_in_date: input.move_in_date,
          move_out_date: input.move_out_date || null,
          status: input.status,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
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
      const { error } = await supabase.from('tenants').delete().eq('id', id)
      if (error) throw error
      // Mark unit as vacant
      await supabase.from('units').update({ status: 'vacant' }).eq('id', unitId)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tenants'] })
      qc.invalidateQueries({ queryKey: ['units'] })
    },
  })
}
