import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useBills'
import { useBuildings } from '@/hooks/useBuildings'
import { useTenants } from '@/hooks/useTenants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Building2, Users, CheckCircle2, AlertCircle, DoorOpen, ArrowRight } from 'lucide-react'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function StatCard({ title, value, sub, icon: Icon, className }: {
  title: string
  value: string | number
  sub?: string
  icon: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${className ?? 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: buildings } = useBuildings()
  const { data: tenants } = useTenants()

  const year = new Date().getFullYear()
  const chartData = stats
    ? MONTH_NAMES.map((name, i) => ({
        name,
        Income: stats.monthlyIncome[i + 1] ?? 0,
      }))
    : []

  const activeTenants = tenants?.filter(t => t.status === 'active').length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of your properties</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Buildings"
          value={buildings?.length ?? 0}
          icon={Building2}
        />
        <StatCard
          title="Active Tenants"
          value={activeTenants}
          icon={Users}
        />
        <StatCard
          title={`Collected (${year})`}
          value={`₱${(stats?.totalPaid ?? 0).toLocaleString()}`}
          sub="Paid bills this year"
          icon={CheckCircle2}
          className="text-green-600"
        />
        <StatCard
          title="Outstanding"
          value={`₱${(stats?.totalUnpaid ?? 0).toLocaleString()}`}
          sub="Unpaid bills"
          icon={AlertCircle}
          className="text-destructive"
        />
      </div>

      {/* Occupancy */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DoorOpen className="h-4 w-4" /> Unit Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Occupied</span>
                  <span className="font-medium text-green-600">{stats?.occupied ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vacant</span>
                  <span className="font-medium">{stats?.vacant ?? 0}</span>
                </div>
                {((stats?.occupied ?? 0) + (stats?.vacant ?? 0)) > 0 && (
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.round(((stats?.occupied ?? 0) / ((stats?.occupied ?? 0) + (stats?.vacant ?? 0))) * 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Bills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" /> Unpaid Bills
            </CardTitle>
            <Link to="/billing?status=unpaid">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View all <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {!stats?.overdueBills?.length ? (
              <p className="text-sm text-muted-foreground">All bills are paid!</p>
            ) : (
              stats.overdueBills.slice(0, 5).map(b => {
                const tenantData = b.tenants as { name: string } | null
                return (
                  <div key={b.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{tenantData?.name}</span>
                      <span className="text-muted-foreground ml-1 text-xs">
                        {MONTH_NAMES[b.billing_month - 1]} {b.billing_year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-destructive">₱{Number(b.total_amount).toLocaleString()}</span>
                      <Badge variant="destructive" className="text-xs">unpaid</Badge>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Income Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Monthly Income — {year}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₱${Number(v).toLocaleString()}`, 'Income']} />
                <Bar dataKey="Income" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
