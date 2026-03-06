-- Migration: Create reports table for community moderation
-- Run this in Supabase SQL Editor

-- Create the reports table
create table if not exists public.reports (
  id uuid default uuid_generate_v4() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.reports enable row level security;

-- Policy: Authenticated users can insert reports
create policy "Authenticated users can insert reports"
  on public.reports for insert with check (auth.role() = 'authenticated');

-- Policy: Admin can view and update all reports
create policy "Admins can view reports"
  on public.reports for select using (auth.email() = 'razerhumbergur@gmail.com');

create policy "Admins can update reports"
  on public.reports for update using (auth.email() = 'razerhumbergur@gmail.com');

-- Create indexes for performance
create index if not exists idx_reports_listing on public.reports(listing_id);
create index if not exists idx_reports_status on public.reports(status);
