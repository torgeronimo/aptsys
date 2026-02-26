import { useParams, Link } from 'react-router-dom'
import { useTenant } from '@/hooks/useTenants'
import { useBills } from '@/hooks/useBills'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, Phone, Mail, Calendar, Building2, DoorOpen } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: tenant, isLoading } = useTenant(id!)
  const { data: bills } = useBills({ tenantId: id })

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>
  }

  if (!tenant) {
    return <div className="text-muted-foreground">Tenant not found.</div>
  }

  const unit = tenant.units as { unit_number: string; buildings: { name: string; address: string }; rent_amount: number } | null

  // Build chart data from bills (last 12 bills sorted by period)
  const chartData = [...(bills ?? [])]
    .sort((a, b) => a.billing_year !== b.billing_year ? a.billing_year - b.billing_year : a.billing_month - b.billing_month)
    .slice(-12)
    .map(b => ({
      period: `${MONTH_NAMES[b.billing_month - 1]} ${b.billing_year}`,
      Electricity: Number(b.elec_amount),
      Water: Number(b.water_amount),
      Rent: Number(b.rent_amount),
    }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tenants">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{tenant.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>{tenant.status}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Tenant Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Tenant Information</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {tenant.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.phone}</span>
              </div>
            )}
            {tenant.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{tenant.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Moved in: {tenant.move_in_date}</span>
            </div>
            {tenant.move_out_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Moved out: {tenant.move_out_date}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unit Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Unit</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>{unit?.buildings?.name ?? '—'}</span>
            </div>
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-muted-foreground" />
              <span>Unit {unit?.unit_number ?? '—'}</span>
            </div>
            <p className="text-muted-foreground">{unit?.buildings?.address}</p>
            <p className="font-medium">₱{Number(unit?.rent_amount ?? 0).toLocaleString()}/month</p>
          </CardContent>
        </Card>
      </div>

      {/* Bill History Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Bill History</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₱${v}`} />
                <Tooltip formatter={(v) => `₱${Number(v).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="Electricity" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Water" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Rent" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Bill Table */}
      <Card>
        <CardHeader><CardTitle className="text-base">All Bills</CardTitle></CardHeader>
        <CardContent className="p-0">
          {!bills?.length ? (
            <p className="text-sm text-muted-foreground p-4">No bills recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Prev Reading</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Curr Reading</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Consumed</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Rate (₱/kWh)</TableHead>
                  <TableHead>Electricity</TableHead>
                  <TableHead>Water</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map(b => (
                  <TableRow key={b.id}>
                    <TableCell className="whitespace-nowrap">{MONTH_NAMES[b.billing_month - 1]} {b.billing_year}</TableCell>
                    <TableCell>₱{Number(b.rent_amount).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{Number(b.elec_prev_reading).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{Number(b.elec_curr_reading).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{(Number(b.elec_curr_reading) - Number(b.elec_prev_reading)).toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">₱{Number(b.elec_rate).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(b.elec_amount).toLocaleString()}</TableCell>
                    <TableCell>₱{Number(b.water_amount).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₱{Number(b.total_amount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={b.status === 'paid' ? 'default' : 'destructive'}>{b.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
