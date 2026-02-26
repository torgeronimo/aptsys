import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTenants, useCreateTenant, useUpdateTenant, useDeleteTenant } from '@/hooks/useTenants'
import { useUnits } from '@/hooks/useUnits'
import { useBuildings } from '@/hooks/useBuildings'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { tenantSchema, type TenantInput } from '@/lib/schemas'
import type { Tenant } from '@/types/database'
import { Plus, Users, Pencil, Trash2, ExternalLink, Search } from 'lucide-react'
import { toast } from 'sonner'

export function TenantsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [buildingFilter, setBuildingFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Tenant | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; unitId: string } | null>(null)

  const { data: buildings } = useBuildings()
  const { data: allUnits } = useUnits()
  const { data: tenants, isLoading } = useTenants({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    buildingId: buildingFilter !== 'all' ? buildingFilter : undefined,
  })

  const createTenant = useCreateTenant()
  const updateTenant = useUpdateTenant()
  const deleteTenant = useDeleteTenant()

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TenantInput>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { status: 'active' },
  })

  const openCreate = () => {
    setEditTarget(null)
    reset({ name: '', phone: '', email: '', unit_id: '', move_in_date: '', status: 'active' })
    setFormOpen(true)
  }

  const openEdit = (t: Tenant) => {
    setEditTarget(t)
    reset({
      name: t.name,
      phone: t.phone ?? '',
      email: t.email ?? '',
      unit_id: t.unit_id,
      move_in_date: t.move_in_date,
      move_out_date: t.move_out_date ?? '',
      status: t.status,
    })
    setFormOpen(true)
  }

  const onSubmit = async (data: TenantInput) => {
    if (editTarget) {
      await updateTenant.mutateAsync({ id: editTarget.id, input: data })
      toast.success('Tenant updated')
    } else {
      await createTenant.mutateAsync(data)
      toast.success('Tenant added')
    }
    setFormOpen(false)
    reset()
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    await deleteTenant.mutateAsync({ id: deleteTarget.id, unitId: deleteTarget.unitId })
    toast.success('Tenant removed')
    setDeleteTarget(null)
  }

  const filteredTenants = tenants?.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.phone ?? '').includes(search)
  )

  // Units available for form: all vacant + the tenant's current unit
  const availableUnits = allUnits?.filter(u => u.status === 'vacant' || u.id === editTarget?.unit_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-muted-foreground text-sm">Manage all your tenants</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Tenant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Building" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings?.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : !filteredTenants?.length ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">No tenants found</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Move-in</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((t) => {
                const unit = t.units as { unit_number: string; buildings: { name: string } } | null
                return (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>Unit {unit?.unit_number ?? '—'}</TableCell>
                    <TableCell>{unit?.buildings?.name ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{t.phone ?? '—'}</TableCell>
                    <TableCell>{t.move_in_date}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link to={`/tenants/${t.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => setDeleteTarget({ id: t.id, name: t.name, unitId: t.unit_id })}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Juan dela Cruz" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input placeholder="09xx-xxx-xxxx" {...register('phone')} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="juan@example.com" {...register('email')} />
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Controller
                name="unit_id"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits?.map(u => {
                        const unitBuildings = u.buildings as { name: string } | null
                        return (
                          <SelectItem key={u.id} value={u.id}>
                            {unitBuildings?.name} — Unit {u.unit_number}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit_id && <p className="text-destructive text-xs">{errors.unit_id.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Move-in Date</Label>
                <Input type="date" {...register('move_in_date')} />
                {errors.move_in_date && <p className="text-destructive text-xs">{errors.move_in_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Move-out Date</Label>
                <Input type="date" {...register('move_out_date')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTenant.isPending || updateTenant.isPending}>
                {editTarget ? 'Save Changes' : 'Add Tenant'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove Tenant"
        description={`Remove ${deleteTarget?.name} from the system? Their bills will remain in history.`}
        onConfirm={onDelete}
        loading={deleteTenant.isPending}
      />
    </div>
  )
}
