import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})

export const buildingSchema = z.object({
  name: z.string().min(1, 'Building name is required'),
  address: z.string().min(1, 'Address is required'),
})

export const unitSchema = z.object({
  unit_number: z.string().min(1, 'Unit number is required'),
  floor: z.coerce.number().nullable().optional(),
  rent_amount: z.coerce.number().min(0, 'Rent must be non-negative'),
  status: z.enum(['occupied', 'vacant']),
})

export const tenantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  unit_id: z.string().uuid('Select a unit'),
  move_in_date: z.string().min(1, 'Move-in date is required'),
  move_out_date: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']),
})

export const billSchema = z.object({
  tenant_id: z.string().uuid('Select a tenant'),
  billing_month: z.coerce.number().min(1).max(12),
  billing_year: z.coerce.number().min(2000).max(2100),
  rent_amount: z.coerce.number().min(0),
  elec_prev_reading: z.coerce.number().min(0),
  elec_curr_reading: z.coerce.number().min(0),
  elec_rate: z.coerce.number().min(0),
  water_amount: z.coerce.number().min(0),
  notes: z.string().optional().nullable(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type BuildingInput = z.infer<typeof buildingSchema>
export type UnitInput = z.infer<typeof unitSchema>
export type TenantInput = z.infer<typeof tenantSchema>
export type BillInput = z.infer<typeof billSchema>
