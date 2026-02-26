import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { BuildingsPage } from '@/pages/BuildingsPage'
import { BuildingDetailPage } from '@/pages/BuildingDetailPage'
import { TenantsPage } from '@/pages/TenantsPage'
import { TenantDetailPage } from '@/pages/TenantDetailPage'
import { BillingPage } from '@/pages/BillingPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/buildings', element: <BuildingsPage /> },
          { path: '/buildings/:id', element: <BuildingDetailPage /> },
          { path: '/tenants', element: <TenantsPage /> },
          { path: '/tenants/:id', element: <TenantDetailPage /> },
          { path: '/billing', element: <BillingPage /> },
        ],
      },
    ],
  },
])
