export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      buildings: {
        Row: {
          id: string
          owner_id: string
          name: string
          address: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          address?: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          address?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'buildings_owner_id_fkey'
            columns: ['owner_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      units: {
        Row: {
          id: string
          building_id: string
          owner_id: string
          unit_number: string
          floor: number | null
          rent_amount: number
          status: 'occupied' | 'vacant'
        }
        Insert: {
          id?: string
          building_id: string
          owner_id: string
          unit_number: string
          floor?: number | null
          rent_amount?: number
          status?: 'occupied' | 'vacant'
        }
        Update: {
          id?: string
          building_id?: string
          owner_id?: string
          unit_number?: string
          floor?: number | null
          rent_amount?: number
          status?: 'occupied' | 'vacant'
        }
        Relationships: [
          {
            foreignKeyName: 'units_building_id_fkey'
            columns: ['building_id']
            isOneToOne: false
            referencedRelation: 'buildings'
            referencedColumns: ['id']
          }
        ]
      }
      tenants: {
        Row: {
          id: string
          unit_id: string
          owner_id: string
          name: string
          phone: string | null
          email: string | null
          move_in_date: string
          move_out_date: string | null
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          owner_id: string
          name: string
          phone?: string | null
          email?: string | null
          move_in_date: string
          move_out_date?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          id?: string
          unit_id?: string
          owner_id?: string
          name?: string
          phone?: string | null
          email?: string | null
          move_in_date?: string
          move_out_date?: string | null
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'tenants_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          }
        ]
      }
      bills: {
        Row: {
          id: string
          tenant_id: string
          unit_id: string
          owner_id: string
          billing_month: number
          billing_year: number
          rent_amount: number
          elec_prev_reading: number
          elec_curr_reading: number
          elec_rate: number
          elec_amount: number
          water_prev_reading: number
          water_curr_reading: number
          water_rate: number
          water_amount: number
          total_amount: number
          status: 'unpaid' | 'paid'
          paid_at: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          unit_id: string
          owner_id: string
          billing_month: number
          billing_year: number
          rent_amount?: number
          elec_prev_reading?: number
          elec_curr_reading?: number
          elec_rate?: number
          elec_amount?: number
          water_prev_reading?: number
          water_curr_reading?: number
          water_rate?: number
          water_amount?: number
          total_amount?: number
          status?: 'unpaid' | 'paid'
          paid_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          unit_id?: string
          owner_id?: string
          billing_month?: number
          billing_year?: number
          rent_amount?: number
          elec_prev_reading?: number
          elec_curr_reading?: number
          elec_rate?: number
          elec_amount?: number
          water_prev_reading?: number
          water_curr_reading?: number
          water_rate?: number
          water_amount?: number
          total_amount?: number
          status?: 'unpaid' | 'paid'
          paid_at?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bills_tenant_id_fkey'
            columns: ['tenant_id']
            isOneToOne: false
            referencedRelation: 'tenants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bills_unit_id_fkey'
            columns: ['unit_id']
            isOneToOne: false
            referencedRelation: 'units'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Building = Database['public']['Tables']['buildings']['Row']
export type Unit = Database['public']['Tables']['units']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Bill = Database['public']['Tables']['bills']['Row']
