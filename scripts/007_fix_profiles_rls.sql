-- Arreglar políticas RLS de profiles para evitar recursión infinita

-- Eliminar la política problemática que causa recursión
drop policy if exists "admins_select_all" on public.profiles;

-- Eliminar las políticas existentes para recrearlas correctamente
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

-- Crear una función segura para verificar el rol del usuario
create or replace function public.get_user_role(user_id uuid)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = user_id;
$$;

-- Política para SELECT: usuarios pueden ver su propio perfil
-- Los admins pueden ver todos los perfiles usando security definer function
create policy "profiles_select_policy"
  on public.profiles for select
  using (
    auth.uid() = id 
    or public.get_user_role(auth.uid()) = 'admin'
  );

-- Política para INSERT: usuarios solo pueden insertar su propio perfil
create policy "profiles_insert_policy"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Política para UPDATE: usuarios pueden actualizar su propio perfil
-- Los admins pueden actualizar cualquier perfil
create policy "profiles_update_policy"
  on public.profiles for update
  using (
    auth.uid() = id 
    or public.get_user_role(auth.uid()) = 'admin'
  );

-- Política para DELETE: solo admins pueden eliminar perfiles
create policy "profiles_delete_policy"
  on public.profiles for delete
  using (public.get_user_role(auth.uid()) = 'admin');
