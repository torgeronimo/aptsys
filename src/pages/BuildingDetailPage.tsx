import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBuilding } from '@/hooks/useBuildings'
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '@/hooks/useUnits'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { unitSchema, type UnitInput } from '@/lib/schemas'
import type { Unit } from '@/types/database'
import { Plus, ChevronLeft, DoorOpen, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function BuildingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: building } = useBuilding(id!)
  const { data: units, isLoading } = useUnits(id)
  const createUnit = useCreateUnit()
  const updateUnit = useUpdateUnit()
  const deleteUnit = useDeleteUnit()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Unit | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Unit | null>(null)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<UnitInput>({
    resolver: zodResolver(unitSchema) as Resolver<UnitInput>,
    defaultValues: { status: 'vacant', floor: undefined },
  })

  const openCreate = () => {
    setEditTarget(null)
    reset({ unit_number: '', floor: undefined, rent_amount: 0, status: 'vacant' })
    setFormOpen(true)
  }

  const openEdit = (u: Unit) => {
    setEditTarget(u)
    reset({ unit_number: u.unit_number, floor: u.floor ?? undefined, rent_amount: u.rent_amount, status: u.status })
    setFormOpen(true)
  }

  const onSubmit = async (data: UnitInput) => {
    if (editTarget) {
      await updateUnit.mutateAsync({ id: editTarget.id, input: data })
      toast.success('Unit updated')
    } else {
      await createUnit.mutateAsync({ buildingId: id!, input: data })
      toast.success('Unit created')
    }
    setFormOpen(false)
    reset()
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    await deleteUnit.mutateAsync(deleteTarget.id)
    toast.success('Unit deleted')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/buildings">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{building?.name ?? 'Building'}</h1>
          <p className="text-muted-foreground text-sm">{building?.address}</p>
        </div>
        <Button className="ml-auto" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Unit
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : !units?.length ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <DoorOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">No units yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add units to this building</p>
          <Button onClick={openCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Unit
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {units.map((u) => (
            <Card key={u.id} className="group">
              <CardHeader className="pb-1">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium">Unit {u.unit_number}</CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEdit(u)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => setDeleteTarget(u)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <Badge variant={u.status === 'occupied' ? 'default' : 'secondary'} className="text-xs">
                  {u.status}
                </Badge>
                {u.floor != null && (
                  <p className="text-xs text-muted-foreground">Floor {u.floor}</p>
                )}
                <p className="text-sm font-semibold">₱{u.rent_amount.toLocaleString()}/mo</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_number">Unit Number</Label>
                <Input id="unit_number" placeholder="101" {...register('unit_number')} />
                {errors.unit_number && <p className="text-destructive text-xs">{errors.unit_number.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor (optional)</Label>
                <Input id="floor" type="number" placeholder="1" {...register('floor')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rent_amount">Monthly Rent (₱)</Label>
              <Input id="rent_amount" type="number" step="0.01" placeholder="5000" {...register('rent_amount')} />
              {errors.rent_amount && <p className="text-destructive text-xs">{errors.rent_amount.message}</p>}
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
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createUnit.isPending || updateUnit.isPending}>
                {editTarget ? 'Save Changes' : 'Create Unit'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Unit"
        description={`Delete Unit ${deleteTarget?.unit_number}? This cannot be undone.`}
        onConfirm={onDelete}
        loading={deleteUnit.isPending}
      />
    </div>
  )
}
