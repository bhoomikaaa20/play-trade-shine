
-- Roles
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- App settings (singleton)
create table public.app_settings (
  id int primary key default 1,
  default_starting_balance numeric(18,2) not null default 100000,
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);
alter table public.app_settings enable row level security;
insert into public.app_settings (id) values (1);

create policy "Anyone can read settings" on public.app_settings
  for select to authenticated using (true);
create policy "Admins update settings" on public.app_settings
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  cash_balance numeric(18,2) not null default 100000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles
  for select to authenticated using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));
create policy "Users update own profile name" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins update any profile" on public.profiles
  for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Assets
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  symbol text not null unique,
  name text not null,
  sector text,
  current_price numeric(18,4) not null check (current_price >= 0),
  previous_close numeric(18,4) not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.assets enable row level security;

create policy "Anyone can view assets" on public.assets
  for select to authenticated using (true);
create policy "Admins manage assets" on public.assets
  for all to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Holdings
create table public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  quantity numeric(18,6) not null default 0 check (quantity >= 0),
  avg_cost numeric(18,4) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, asset_id)
);
alter table public.holdings enable row level security;

create policy "Users view own holdings" on public.holdings
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid not null references public.assets(id),
  symbol text not null,
  side text not null check (side in ('buy','sell')),
  quantity numeric(18,6) not null check (quantity > 0),
  price numeric(18,4) not null check (price >= 0),
  total numeric(18,4) not null,
  created_at timestamptz not null default now()
);
alter table public.transactions enable row level security;

create policy "Users view own transactions" on public.transactions
  for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- Updated-at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger trg_profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger trg_assets_touch before update on public.assets
  for each row execute function public.touch_updated_at();
create trigger trg_holdings_touch before update on public.holdings
  for each row execute function public.touch_updated_at();
create trigger trg_settings_touch before update on public.app_settings
  for each row execute function public.touch_updated_at();

-- Auto-create profile + role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  starting numeric(18,2);
begin
  select default_starting_balance into starting from public.app_settings where id = 1;
  insert into public.profiles (id, display_name, cash_balance)
    values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)), coalesce(starting, 100000));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
