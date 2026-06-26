-- BUCKET PÚBLICO PARA AS IMAGENS DAS ASSINATURAS
insert into storage.buckets (id, name, public)
values ('vibra-signature-assets', 'vibra-signature-assets', true)
on conflict (id) do nothing;

-- TABELA PRINCIPAL
create table if not exists public.vibra_email_signatures (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text,
  role text,
  email text,
  site text,
  phone text,
  address1 text,
  address2 text,
  cnpj_label text,
  cnpj_number text,
  tagline text,
  name_link text,
  role_link text,
  email_link text,
  site_link text,
  phone_link text,
  address_link text,
  brand_link text,
  image_url text,
  storage_path text,
  html_snippet text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_vibra_email_signatures_updated_at on public.vibra_email_signatures;
create trigger trg_vibra_email_signatures_updated_at
before update on public.vibra_email_signatures
for each row
execute function public.set_updated_at();

alter table public.vibra_email_signatures enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vibra_email_signatures' and policyname = 'vibra_email_signatures_select_all'
  ) then
    create policy vibra_email_signatures_select_all on public.vibra_email_signatures for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vibra_email_signatures' and policyname = 'vibra_email_signatures_insert_all'
  ) then
    create policy vibra_email_signatures_insert_all on public.vibra_email_signatures for insert with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vibra_email_signatures' and policyname = 'vibra_email_signatures_update_all'
  ) then
    create policy vibra_email_signatures_update_all on public.vibra_email_signatures for update using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'vibra_email_signatures' and policyname = 'vibra_email_signatures_delete_all'
  ) then
    create policy vibra_email_signatures_delete_all on public.vibra_email_signatures for delete using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'vibra_signature_assets_public_read'
  ) then
    create policy vibra_signature_assets_public_read on storage.objects for select using (bucket_id = 'vibra-signature-assets');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'vibra_signature_assets_public_insert'
  ) then
    create policy vibra_signature_assets_public_insert on storage.objects for insert with check (bucket_id = 'vibra-signature-assets');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'vibra_signature_assets_public_update'
  ) then
    create policy vibra_signature_assets_public_update on storage.objects for update using (bucket_id = 'vibra-signature-assets') with check (bucket_id = 'vibra-signature-assets');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'vibra_signature_assets_public_delete'
  ) then
    create policy vibra_signature_assets_public_delete on storage.objects for delete using (bucket_id = 'vibra-signature-assets');
  end if;
end $$;
