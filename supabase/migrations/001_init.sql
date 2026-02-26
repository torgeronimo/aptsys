-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz default now() not null
);

-- Buildings
create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  address text not null default '',
  created_at timestamptz default now() not null
);

-- Units
create table public.units (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  unit_number text not null,
  floor integer,
  rent_amount numeric not null default 0,
  status text not null default 'vacant' check (status in ('occupied', 'vacant'))
);

-- Tenants
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  move_in_date date not null,
  move_out_date date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now() not null
);

-- Bills
create table public.bills (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  unit_id uuid not null references public.units(id) on delete restrict,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  billing_month integer not null check (billing_month between 1 and 12),
  billing_year integer not null,
  rent_amount numeric not null default 0,
  elec_prev_reading numeric not null default 0,
  elec_curr_reading numeric not null default 0,
  elec_rate numeric not null default 0,
  elec_amount numeric not null default 0,
  water_prev_reading numeric not null default 0,
  water_curr_reading numeric not null default 0,
  water_rate numeric not null default 0,
  water_amount numeric not null default 0,
  total_amount numeric not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid', 'paid')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz default now() not null
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.buildings enable row level security;
alter table public.units enable row level security;
alter table public.tenants enable row level security;
alter table public.bills enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Buildings policies
create policy "Owner manages buildings" on public.buildings for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Units policies
create policy "Owner manages units" on public.units for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Tenants policies
create policy "Owner manages tenants" on public.tenants for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Bills policies
create policy "Owner manages bills" on public.bills for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
