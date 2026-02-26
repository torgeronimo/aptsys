import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBuildings, useCreateBuilding, useUpdateBuilding, useDeleteBuilding } from '@/hooks/useBuildings'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { buildingSchema, type BuildingInput } from '@/lib/schemas'
import type { Building } from '@/types/database'
import { Plus, Building2, MapPin, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

export function BuildingsPage() {
  const { data: buildings, isLoading } = useBuildings()
  const createBuilding = useCreateBuilding()
  const updateBuilding = useUpdateBuilding()
  const deleteBuilding = useDeleteBuilding()

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Building | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Building | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BuildingInput>({
    resolver: zodResolver(buildingSchema),
  })

  const openCreate = () => {
    setEditTarget(null)
    reset({ name: '', address: '' })
    setFormOpen(true)
  }

  const openEdit = (b: Building) => {
    setEditTarget(b)
    reset({ name: b.name, address: b.address })
    setFormOpen(true)
  }

  const onSubmit = async (data: BuildingInput) => {
    if (editTarget) {
      await updateBuilding.mutateAsync({ id: editTarget.id, input: data })
      toast.success('Building updated')
    } else {
      await createBuilding.mutateAsync(data)
      toast.success('Building created')
    }
    setFormOpen(false)
    reset()
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    await deleteBuilding.mutateAsync(deleteTarget.id)
    toast.success('Building deleted')
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buildings</h1>
          <p className="text-muted-foreground text-sm">Manage your properties and their units</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Building
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm">Loading...</div>
      ) : !buildings?.length ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">No buildings yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first building to get started</p>
          <Button onClick={openCreate} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add Building
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {buildings.map((b) => (
            <Card key={b.id} className="group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{b.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.address}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(b)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteTarget(b)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link to={`/buildings/${b.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Units <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Edit Building' : 'Add Building'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Building Name</Label>
              <Input id="name" placeholder="Block A" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St, City" {...register('address')} />
              {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createBuilding.isPending || updateBuilding.isPending}>
                {editTarget ? 'Save Changes' : 'Create Building'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Building"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will also delete all units inside it.`}
        onConfirm={onDelete}
        loading={deleteBuilding.isPending}
      />
    </div>
  )
}
