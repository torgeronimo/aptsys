import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { UnitInput } from '@/lib/schemas'
import { useAuth } from './useAuth'

export function useUnits(buildingId?: string) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['units', buildingId, user?.id],
    queryFn: async () => {
      let query = supabase.from('units').select('*, buildings(name, address)').order('unit_number')
      if (buildingId) query = query.eq('building_id', buildingId)
      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useCreateUnit() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ buildingId, input }: { buildingId: string; input: UnitInput }) => {
      const { data, error } = await supabase
        .from('units')
        .insert({ ...input, building_id: buildingId, owner_id: user!.id, floor: input.floor ?? null })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  })
}

export function useUpdateUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UnitInput }) => {
      const { data, error } = await supabase
        .from('units')
        .update({ ...input, floor: input.floor ?? null })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  })
}

export function useDeleteUnit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('units').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['units'] }),
  })
}
