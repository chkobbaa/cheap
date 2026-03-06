-- ============================================
-- cheap.tn Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null default '',
  avatar_url text,
  phone text,
  city text,
  role text not null default 'buyer' check (role in ('buyer', 'seller')),
  rating numeric(3,2) default 0,
  items_sold integer default 0,
  verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ============================================
-- LISTINGS TABLE
-- ============================================
create table if not exists public.listings (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric(10,2) not null,
  market_price numeric(10,2),
  category text not null,
  city text not null,
  images text[] default '{}',
  status text not null default 'active' check (status in ('draft', 'active', 'sold', 'closed')),
  views integer default 0,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  boost_amount numeric(10,2) default 0,
  boost_expires_at timestamptz
);

-- RLS
alter table public.listings enable row level security;

create policy "Listings are viewable by everyone"
  on public.listings for select using (true);

create policy "Sellers can insert own listings"
  on public.listings for insert with check (auth.uid() = seller_id);

create policy "Sellers can update own listings"
  on public.listings for update using (auth.uid() = seller_id);

create policy "Sellers can delete own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- ============================================
-- BOOST TRANSACTIONS TABLE
-- ============================================
create table if not exists public.boost_transactions (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric(10,2) not null,
  duration_days integer not null,
  created_at timestamptz default now()
);

-- RLS
alter table public.boost_transactions enable row level security;

create policy "Users can view own boost transactions"
  on public.boost_transactions for select using (auth.uid() = user_id);

create policy "Users can insert own boost transactions"
  on public.boost_transactions for insert with check (auth.uid() = user_id);

-- ============================================
-- FAVORITES TABLE
-- ============================================
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- RLS
alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete set null,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table public.messages enable row level security;

create policy "Users can view own messages"
  on public.messages for select using (
    auth.uid() = sender_id or auth.uid() = receiver_id
  );

create policy "Users can send messages"
  on public.messages for insert with check (auth.uid() = sender_id);

create policy "Users can mark own received messages as read"
  on public.messages for update using (auth.uid() = receiver_id);

-- ============================================
-- STORAGE BUCKET FOR LISTING IMAGES
-- ============================================
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_listings_seller on public.listings(seller_id);
create index if not exists idx_listings_category on public.listings(category);
create index if not exists idx_listings_status on public.listings(status);
create index if not exists idx_listings_created on public.listings(created_at desc);
create index if not exists idx_favorites_user on public.favorites(user_id);
create index if not exists idx_messages_sender on public.messages(sender_id);
create index if not exists idx_messages_receiver on public.messages(receiver_id);

-- ============================================
-- ENABLE REALTIME FOR MESSAGES
-- ============================================
alter publication supabase_realtime add table public.messages;

-- ============================================
-- REPORTS TABLE (Community Moderation)
-- ============================================
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz default now()
);

-- RLS
alter table public.reports enable row level security;

-- Authenticated users can insert reports
create policy "Authenticated users can insert reports"
  on public.reports for insert with check (auth.role() = 'authenticated');

-- Admin can view and update all reports
create policy "Admins can view reports"
  on public.reports for select using (auth.email() = 'razerhumbergur@gmail.com');

create policy "Admins can update reports"
  on public.reports for update using (auth.email() = 'razerhumbergur@gmail.com');

create index if not exists idx_reports_listing on public.reports(listing_id);
create index if not exists idx_reports_status on public.reports(status);
