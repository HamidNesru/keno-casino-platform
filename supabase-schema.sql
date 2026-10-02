-- Run this once in Supabase SQL Editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  display_name text,
  role text not null default 'player' check (role in ('player','admin')),
  credits bigint not null default 10000 check (credits >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.credit_transactions (
  id bigint generated always as identity primary key,
  player_id uuid not null references public.profiles(id) on delete cascade,
  admin_id uuid references public.profiles(id),
  amount bigint not null,
  reason text not null default 'Admin adjustment',
  created_at timestamptz not null default now()
);

create table if not exists public.game_rounds (
  id bigint generated always as identity primary key,
  player_id uuid references public.profiles(id) on delete set null,
  game text not null,
  stake bigint not null default 0,
  payout bigint not null default 0,
  label text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.credit_transactions enable row level security;
alter table public.game_rounds enable row level security;

create or replace function public.is_admin(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = uid and role = 'admin'); $$;

create or replace function public.adjust_player_credits(target uuid, delta bigint, note text default 'Admin adjustment')
returns bigint language plpgsql security definer set search_path = public
as $$
declare new_balance bigint;
begin
  if not public.is_admin(auth.uid()) then raise exception 'Admin access required'; end if;
  update public.profiles set credits = greatest(0, credits + delta) where id = target returning credits into new_balance;
  if new_balance is null then raise exception 'Player not found'; end if;
  insert into public.credit_transactions(player_id, admin_id, amount, reason) values(target, auth.uid(), delta, note);
  return new_balance;
end; $$;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select using (id = auth.uid() or public.is_admin(auth.uid()));
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists admin_profiles_all on public.profiles;
create policy admin_profiles_all on public.profiles for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists own_rounds on public.game_rounds;
create policy own_rounds on public.game_rounds for select using (player_id = auth.uid() or public.is_admin(auth.uid()));
create policy own_round_insert on public.game_rounds for insert with check (player_id = auth.uid());
create policy admin_rounds on public.game_rounds for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

drop policy if exists own_transactions on public.credit_transactions;
create policy own_transactions on public.credit_transactions for select using (player_id = auth.uid() or public.is_admin(auth.uid()));
create policy admin_transactions on public.credit_transactions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles(id, phone, display_name) values(new.id, new.phone, coalesce(new.raw_user_meta_data->>'display_name', 'Player')) on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Players may debit their own virtual balance. Positive balance changes should be
-- performed only by this site's game settlement logic; admin adjustments use the
-- separate adjust_player_credits function above.
create or replace function public.change_own_credits(delta bigint, reason text default 'Game')
returns bigint language plpgsql security definer set search_path = public
as $$
declare new_balance bigint;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if delta > 0 then
    -- Demo settlement: the game client records a payout after a completed round.
    -- For production, move random/result validation into an Edge Function.
    null;
  end if;
  update public.profiles set credits = greatest(0, credits + delta) where id = auth.uid() returning credits into new_balance;
  if new_balance is null then raise exception 'Player profile not found'; end if;
  return new_balance;
end; $$;
