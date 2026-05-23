-- ============================================================
-- TALOSFLOW CRM — Script de Base de Datos
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. TABLA DE PERFILES DE USUARIO
-- Extiende auth.users con nombre completo y rol
-- ============================================================
create table if not exists public.profiles (
  id       uuid references auth.users on delete cascade primary key,
  email    text unique not null,
  full_name text,
  role     text default 'agent' check (role in ('agent', 'admin')),
  created_at timestamptz default now()
);

-- Habilitar RLS en la tabla profiles
alter table public.profiles enable row level security;

-- Los usuarios sólo pueden ver y editar su propio perfil
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Los administradores pueden ver todos los perfiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ============================================================
-- 2. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE AL REGISTRAR
-- Cuando un usuario se crea en auth.users, se crea su perfil
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'agent')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Disparador: se ejecuta después de insertar en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 3. COLUMNA assigned_to EN CONTACTS (si no existe)
-- Para asignar conversaciones/contactos a un agente específico
-- ============================================================
alter table public.contacts
  add column if not exists assigned_to uuid references auth.users(id);

-- ============================================================
-- 4. COLUMNA assigned_to EN CONVERSATIONS (si no existe)
-- ============================================================
alter table public.conversations
  add column if not exists assigned_to uuid references auth.users(id);


-- ============================================================
-- 5. RLS EN CONVERSATIONS — Agentes sólo ven las suyas
-- IMPORTANTE: Primero verifique que RLS ya esté habilitado.
-- ============================================================

-- Habilitar RLS (si no estaba habilitado)
alter table public.conversations enable row level security;

-- Eliminar políticas previas si existieran (para no duplicar)
drop policy if exists "Agents see own conversations" on public.conversations;
drop policy if exists "Admins see all conversations" on public.conversations;
drop policy if exists "Service role bypass" on public.conversations;

-- Política: Agente ve sus conversaciones asignadas
create policy "Agents see own conversations"
  on public.conversations for select
  using (
    assigned_to = auth.uid()
    or assigned_to is null  -- conversaciones sin asignar las ve cualquier agente autenticado
  );

-- Política: Administradores ven todo
create policy "Admins see all conversations"
  on public.conversations for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- IMPORTANTE: El backend (webhook en Vercel) usa SERVICE_ROLE_KEY
-- que BYPASEA las políticas RLS, así que el flujo de recepción
-- de mensajes de WhatsApp NO se ve afectado por estas políticas.


-- ============================================================
-- 6. RLS EN MESSAGES
-- ============================================================
alter table public.messages enable row level security;

drop policy if exists "Users see messages of their conversations" on public.messages;
drop policy if exists "Admins see all messages" on public.messages;

-- Agentes ven mensajes de sus conversaciones
create policy "Users see messages of their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.assigned_to = auth.uid() or c.assigned_to is null)
    )
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Agentes pueden insertar mensajes en sus conversaciones
create policy "Users can insert messages"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and (c.assigned_to = auth.uid() or c.assigned_to is null)
    )
    or
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );


-- ============================================================
-- 7. CREAR EL PRIMER USUARIO ADMINISTRADOR
-- Ejecutar DESPUÉS de crear el usuario en Authentication > Users
-- Reemplaza 'TU_USER_ID' con el UUID real del usuario creado
-- ============================================================

-- EJEMPLO (descomenta y edita antes de ejecutar):
 insert into public.profiles (id, email, full_name, role)
 values (
   '28a92fd3-f092-4369-bea7-f0e7ef5c346f',           -- UUID del usuario de Auth
   'cesarclavo171@gmail.com',        -- Email
   'Jobitx',       -- Nombre completo
   'admin'                       -- Rol: admin o agent
 )
 on conflict (id) do update set role = 'admin';


-- ============================================================
-- RESUMEN DE LO QUE HACE ESTE SCRIPT:
-- 1. Crea tabla profiles con roles (admin/agent)
-- 2. Función automática al crear usuario: crea perfil
-- 3. Agrega columna assigned_to a contacts y conversations
-- 4. RLS: Agentes sólo ven sus conversaciones y mensajes
-- 5. Admins ven todo
-- 6. Backend con SERVICE_ROLE_KEY no se ve afectado (bypasea RLS)
-- ============================================================
