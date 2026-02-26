import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BillInput } from '@/lib/schemas'
import { useAuth } from './useAuth'

export function useBills(filters?: { tenantId?: string; status?: string; year?: number; month?: number }) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['bills', filters, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('bills')
        .select('*, tenants(name), units(unit_number, buildings(name))')
        .order('billing_year', { ascending: false })
        .order('billing_month', { ascending: false })
      if (filters?.tenantId) query = query.eq('tenant_id', filters.tenantId)
      if (filters?.status) query = query.eq('status', filters.status as 'unpaid' | 'paid')
      if (filters?.year) query = query.eq('billing_year', filters.year)
      if (filters?.month) query = query.eq('billing_month', filters.month)
      const { data, error } = await query
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

export function useBill(id: string) {
  return useQuery({
    queryKey: ['bills', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*, tenants(name), units(unit_number, buildings(name))')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

export function useDashboardStats() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      const now = new Date()
      const currentYear = now.getFullYear()

      // Fetch all bills for the current year
      const { data: yearBills, error: yearError } = await supabase
        .from('bills')
        .select('billing_month, billing_year, total_amount, status')
        .eq('billing_year', currentYear)
        .order('billing_month')
      if (yearError) throw yearError

      // Monthly income (paid bills only)
      const monthlyIncome: Record<number, number> = {}
      for (let m = 1; m <= 12; m++) monthlyIncome[m] = 0
      yearBills?.forEach((b) => {
        if (b.status === 'paid') {
          monthlyIncome[b.billing_month] = (monthlyIncome[b.billing_month] ?? 0) + Number(b.total_amount)
        }
      })

      // Overdue bills
      const { data: overdueBills, error: overdueError } = await supabase
        .from('bills')
        .select('*, tenants(name), units(unit_number, buildings(name))')
        .eq('status', 'unpaid')
        .order('billing_year')
        .order('billing_month')
        .limit(10)
      if (overdueError) throw overdueError

      // Totals
      const totalPaid = yearBills?.filter(b => b.status === 'paid').reduce((s, b) => s + Number(b.total_amount), 0) ?? 0
      const totalUnpaid = yearBills?.filter(b => b.status === 'unpaid').reduce((s, b) => s + Number(b.total_amount), 0) ?? 0

      // Units stats
      const { data: units, error: unitsError } = await supabase.from('units').select('status')
      if (unitsError) throw unitsError
      const occupied = units?.filter(u => u.status === 'occupied').length ?? 0
      const vacant = units?.filter(u => u.status === 'vacant').length ?? 0

      return { monthlyIncome, overdueBills, totalPaid, totalUnpaid, occupied, vacant }
    },
    enabled: !!user,
  })
}

export function useCreateBill() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ input, unitId }: { input: BillInput; unitId: string }) => {
      const elec_amount = (input.elec_curr_reading - input.elec_prev_reading) * input.elec_rate
      const water_amount = input.water_amount
      const total_amount = input.rent_amount + elec_amount + water_amount

      const { data, error } = await supabase
        .from('bills')
        .insert({
          tenant_id: input.tenant_id,
          unit_id: unitId,
          owner_id: user!.id,
          billing_month: input.billing_month,
          billing_year: input.billing_year,
          rent_amount: input.rent_amount,
          elec_prev_reading: input.elec_prev_reading,
          elec_curr_reading: input.elec_curr_reading,
          elec_rate: input.elec_rate,
          elec_amount,
          water_prev_reading: 0,
          water_curr_reading: 0,
          water_rate: 0,
          water_amount,
          total_amount,
          status: 'unpaid',
          notes: input.notes || null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useUpdateBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input, unitId }: { id: string; input: BillInput; unitId: string }) => {
      const elec_amount = (input.elec_curr_reading - input.elec_prev_reading) * input.elec_rate
      const water_amount = input.water_amount
      const total_amount = input.rent_amount + elec_amount + water_amount

      const { data, error } = await supabase
        .from('bills')
        .update({
          unit_id: unitId,
          billing_month: input.billing_month,
          billing_year: input.billing_year,
          rent_amount: input.rent_amount,
          elec_prev_reading: input.elec_prev_reading,
          elec_curr_reading: input.elec_curr_reading,
          elec_rate: input.elec_rate,
          elec_amount,
          water_prev_reading: 0,
          water_curr_reading: 0,
          water_rate: 0,
          water_amount,
          total_amount,
          notes: input.notes || null,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useMarkBillPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const { error } = await supabase
        .from('bills')
        .update({ status: paid ? 'paid' : 'unpaid', paid_at: paid ? new Date().toISOString() : null })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export function useDeleteBill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('bills').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}
