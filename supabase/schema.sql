-- PowerHouse Schema (Phase 1 ready; Phase 2+ will log here)
create extension if not exists "uuid-ossp";

create table if not exists niches (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  source text,
  created_at timestamp with time zone default now()
);

create table if not exists keywords (
  id uuid primary key default uuid_generate_v4(),
  niche_id uuid,
  keyword text not null,
  volume int,
  cpc numeric,
  competition numeric,
  created_at timestamp with time zone default now()
);
