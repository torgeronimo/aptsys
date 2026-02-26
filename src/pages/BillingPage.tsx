import { useState } from 'react'
import { useBills, useCreateBill, useUpdateBill, useMarkBillPaid, useDeleteBill } from '@/hooks/useBills'
import { useTenants } from '@/hooks/useTenants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useForm, Controller, useWatch, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { billSchema, type BillInput } from '@/lib/schemas'
import type { Bill } from '@/types/database'
import { Plus, Receipt, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

function BillCalcPreview({ control }: { control: ReturnType<typeof useForm<BillInput>>['control'] }) {
  const values = useWatch({ control })
  const elec = ((Number(values.elec_curr_reading) || 0) - (Number(values.elec_prev_reading) || 0)) * (Number(values.elec_rate) || 0)
  const water = Number(values.water_amount) || 0
  const total = (Number(values.rent_amount) || 0) + elec + water

  return (
    <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
      <div className="flex justify-between"><span>Electricity</span><span className="font-medium">₱{elec.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Water</span><span className="font-medium">₱{water.toFixed(2)}</span></div>
      <div className="flex justify-between"><span>Rent</span><span className="font-medium">₱{Number(values.rent_amount || 0).toFixed(2)}</span></div>
      <Separator />
      <div className="flex justify-between font-bold text-base"><span>Total</span><span>₱{total.toFixed(2)}</span></div>
    </div>
  )
}

export function BillingPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [yearFilter, setYearFilter] = useState<string>(String(currentYear))
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Bill | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { data: bills, isLoading } = useBills({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    month: monthFilter !== 'all' ? Number(monthFilter) : undefined,
    year: yearFilter !== 'all' ? Number(yearFilter) : undefined,
  })
  const { data: tenants } = useTenants({ status: 'active' })

  const createBill = useCreateBill()
  const updateBill = useUpdateBill()
  const markPaid = useMarkBillPaid()
  const deleteBill = useDeleteBill()

  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<BillInput>({
    resolver: zodResolver(billSchema) as Resolver<BillInput>,
    defaultValues: {
      billing_month: new Date().getMonth() + 1,
      billing_year: currentYear,
      elec_rate: 11,
      water_amount: 0,
    },
  })

  const openCreate = () => {
    setEditTarget(null)
    reset({
      billing_month: new Date().getMonth() + 1,
      billing_year: currentYear,
      rent_amount: 0,
      elec_prev_reading: 0,
      elec_curr_reading: 0,
      elec_rate: 11,
      water_amount: 0,
      notes: '',
    })
    setFormOpen(true)
  }

  const openEdit = (b: Bill) => {
    setEditTarget(b)
    reset({
      tenant_id: b.tenant_id,
      billing_month: b.billing_month,
      billing_year: b.billing_year,
      rent_amount: b.rent_amount,
      elec_prev_reading: b.elec_prev_reading,
      elec_curr_reading: b.elec_curr_reading,
      elec_rate: b.elec_rate,
      water_amount: b.water_amount,
      notes: b.notes ?? '',
    })
    setFormOpen(true)
  }

  const onTenantChange = (tenantId: string) => {
    const tenant = tenants?.find(t => t.id === tenantId)
    if (tenant) {
      const unit = tenant.units as { rent_amount: number } | null
      setValue('rent_amount', unit?.rent_amount ?? 0)
    }
  }

  const onSubmit = async (data: BillInput) => {
    const tenant = tenants?.find(t => t.id === data.tenant_id)
    const unitId = tenant?.unit_id ?? ''
    if (!unitId) { toast.error('Could not find tenant unit'); return }

    if (editTarget) {
      await updateBill.mutateAsync({ id: editTarget.id, input: data, unitId })
      toast.success('Bill updated')
    } else {
      await createBill.mutateAsync({ input: data, unitId })
      toast.success('Bill created')
    }
    setFormOpen(false)
    reset()
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    await deleteBill.mutateAsync(deleteTarget)
    toast.success('Bill deleted')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground text-sm">Record and manage monthly bills</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Bill
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={monthFilter} onValueChange={setMonthFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : !bills?.length ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">No bills found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Electricity</TableHead>
                <TableHead>Water</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map(b => {
                const tenantData = b.tenants as { name: string } | null
                const unitData = (b.units as unknown) as { unit_number: string; buildings: { name: string } } | null
                return (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap">{MONTHS[b.billing_month - 1].slice(0, 3)} {b.billing_year}</TableCell>
                    <TableCell>{tenantData?.name ?? '—'}</TableCell>
                    <TableCell>{unitData ? `${unitData.buildings?.name} U${unitData.unit_number}` : '—'}</TableCell>
                    <TableCell>₱{Number(b.rent_amount).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(b.elec_amount).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(b.water_amount).toLocaleString()}</TableCell>
                    <TableCell className="font-semibold">₱{Number(b.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === 'paid' ? 'default' : 'destructive'}>{b.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title={b.status === 'paid' ? 'Mark unpaid' : 'Mark paid'}
                          onClick={() => markPaid.mutate({ id: b.id, paid: b.status !== 'paid' })}
                        >
                          {b.status === 'paid'
                            ? <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                            : <CheckCircle className="h-3.5 w-3.5 text-green-600" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(b)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteTarget(b.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Bill' : 'New Monthly Bill'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-4">
            {/* Tenant */}
            <div className="space-y-2">
              <Label>Tenant</Label>
              <Controller
                name="tenant_id"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => { field.onChange(v); onTenantChange(v) }}
                    disabled={!!editTarget}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants?.map(t => {
                        const unit = t.units as { unit_number: string; buildings: { name: string } } | null
                        return (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name} — {unit?.buildings?.name} U{unit?.unit_number}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tenant_id && <p className="text-destructive text-xs">{errors.tenant_id.message}</p>}
            </div>

            {/* Billing Period */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Controller
                  name="billing_month"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={v => field.onChange(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Controller
                  name="billing_year"
                  control={control}
                  render={({ field }) => (
                    <Select value={String(field.value)} onValueChange={v => field.onChange(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Rent */}
            <div className="space-y-2">
              <Label>Rent Amount (₱)</Label>
              <Input type="number" step="0.01" {...register('rent_amount')} />
            </div>

            <Separator />

            {/* Electricity */}
            <p className="text-sm font-medium text-muted-foreground">Electricity</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Prev Reading</Label>
                <Input type="number" step="0.01" {...register('elec_prev_reading')} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Curr Reading</Label>
                <Input type="number" step="0.01" {...register('elec_curr_reading')} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Rate (₱/kWh)</Label>
                <Input type="number" step="0.01" {...register('elec_rate')} />
              </div>
            </div>

            <Separator />

            {/* Water */}
            <div className="space-y-2">
              <Label>Water Bill Amount (₱)</Label>
              <Input type="number" step="0.01" placeholder="0.00" {...register('water_amount')} />
            </div>

            {/* Live Preview */}
            <BillCalcPreview control={control} />

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input placeholder="Any remarks..." {...register('notes')} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createBill.isPending || updateBill.isPending}>
                {editTarget ? 'Save Changes' : 'Create Bill'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Bill"
        description="Delete this bill record? This cannot be undone."
        onConfirm={onDelete}
        loading={deleteBill.isPending}
      />
    </div>
  )
}
