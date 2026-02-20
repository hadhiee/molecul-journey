-- 1. Create the 'evidence' bucket (Public)
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', true)
on conflict (id) do nothing;

-- 2. Allow Public View Access (So images/PDFs can be previewed)
create policy "Public Select Evidence"
  on storage.objects for select
  using ( bucket_id = 'evidence' );

-- 3. Allow Uploads (Insert)
-- Note: Since we are using NextAuth and simple Supabase client (Anon), 
-- we allow public uploads. For production, integrate Supabase Auth.
create policy "Public Insert Evidence"
  on storage.objects for insert
  with check ( bucket_id = 'evidence' );

-- 4. Allow Updates (Optional, if overwriting files is needed)
create policy "Public Update Evidence"
  on storage.objects for update
  using ( bucket_id = 'evidence' );
