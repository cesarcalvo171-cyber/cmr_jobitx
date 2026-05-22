-- supabase_schema.sql
-- Script completo de base de datos PostgreSQL para TalosFlow CRM

-- Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLAS PRINCIPALES
-- ==========================================

-- Tabla de Contactos
create table if not exists contacts (
    id uuid default uuid_generate_v4() primary key,
    phone text not null unique,
    name text not null,
    avatar text,
    blocked boolean default false,
    lead_score text default 'cold' check (lead_score in ('hot', 'warm', 'cold')),
    ad_source text default 'Orgánico',
    assigned_to text default 'Erik Taveras',
    bot_enabled boolean default true,
    tags text[] default '{}'::text[],
    created_at timestamptz default now()
);

-- Tabla de Conversaciones
create table if not exists conversations (
    id uuid default uuid_generate_v4() primary key,
    contact_id uuid not null references contacts(id) on delete cascade,
    status text default 'active' check (status in ('active', 'archived', 'snoozed')),
    unread_count integer default 0,
    last_message_at timestamptz default now(),
    created_at timestamptz default now()
);

-- Tabla de Mensajes
create table if not exists messages (
    id uuid default uuid_generate_v4() primary key,
    conversation_id uuid not null references conversations(id) on delete cascade,
    role text not null check (role in ('user', 'assistant', 'agent')),
    content text not null,
    whatsapp_message_id text unique,
    status text default 'sent' check (status in ('sent', 'delivered', 'read', 'failed')),
    created_at timestamptz default now()
);

-- Tabla de Leads (Pipeline de Ventas)
create table if not exists leads (
    id uuid default uuid_generate_v4() primary key,
    contact_id uuid not null references contacts(id) on delete cascade,
    score text not null check (score in ('hot', 'warm', 'cold')),
    reason text,
    notified boolean default false,
    stage text default 'Nuevo' check (stage in ('Nuevo', 'Contactado', 'Demo Programada', 'Propuesta', 'Cerrado')),
    value text default '$0/mes',
    created_at timestamptz default now()
);

-- Tabla de Ajustes (Settings)
create table if not exists settings (
    key text primary key,
    value jsonb not null
);

-- Tabla de Logs de Automatizaciones
create table if not exists automation_logs (
    id uuid default uuid_generate_v4() primary key,
    type text not null,
    payload jsonb,
    status text not null,
    created_at timestamptz default now()
);

-- ==========================================
-- 2. ÍNDICES (Optimización de búsquedas y uniones)
-- ==========================================
create index if not exists idx_contacts_phone on contacts(phone);
create index if not exists idx_conversations_contact on conversations(contact_id);
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_leads_contact on leads(contact_id);
create index if not exists idx_messages_created_at on messages(created_at desc);

-- ==========================================
-- 3. TRIGGERS Y FUNCIONES
-- ==========================================

-- Función para actualizar el timestamp de la conversación al recibir un mensaje
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
    update conversations
    set last_message_at = new.created_at,
        unread_count = case 
            when new.role = 'user' then unread_count + 1 
            else 0 
        end
    where id = new.conversation_id;
    return new;
end;
$$ language plpgsql;

create trigger trigger_update_conversation_timestamp
after insert on messages
for each row execute function update_conversation_timestamp();

-- ==========================================
-- 4. SEGURIDAD Y POLÍTICAS (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
alter table contacts enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;
alter table settings enable row level security;
alter table automation_logs enable row level security;

-- Crear políticas permisivas para desarrollo/conectividad directa
-- Nota: En producción real, restringir usando auth.role() = 'authenticated'
create policy "Permitir todo a usuarios públicos y autenticados en contacts" 
    on contacts for all using (true) with check (true);

create policy "Permitir todo a usuarios públicos y autenticados en conversations" 
    on conversations for all using (true) with check (true);

create policy "Permitir todo a usuarios públicos y autenticados en messages" 
    on messages for all using (true) with check (true);

create policy "Permitir todo a usuarios públicos y autenticados en leads" 
    on leads for all using (true) with check (true);

create policy "Permitir todo a usuarios públicos y autenticados en settings" 
    on settings for all using (true) with check (true);

create policy "Permitir todo a usuarios públicos y autenticados en automation_logs" 
    on automation_logs for all using (true) with check (true);

-- ==========================================
-- 5. PUBLICACIONES REALTIME (Supabase Realtime)
-- ==========================================
begin;
  -- Eliminar publicación existente si hay conflicto
  drop publication if exists supabase_realtime;
  -- Crear publicación con soporte realtime para nuestras tablas clave
  create publication supabase_realtime for table contacts, conversations, messages, leads;
commit;

-- ==========================================
-- 6. FINAL DE ARCHIVO
-- ==========================================

