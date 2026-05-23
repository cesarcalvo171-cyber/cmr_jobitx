# Implementación de Login y Rediseño del Frontend

## Resumen de lo trabajado y guía de uso (Hasta ahora)

### Lo que hemos implementado:
1. **Base de Datos (Supabase):** Tablas para Contactos, Conversaciones, Mensajes, Leads y Logs. Tiempo real habilitado.
2. **Backend (Vercel):** Webhook configurado en Node.js que recibe mensajes de WhatsApp, guarda en base de datos y conecta con la IA (OpenRouter).
3. **Frontend (Vite/React):** Panel básico de CRM en tiempo real que escucha nuevos mensajes.
4. **WhatsApp Cloud API:** Integración configurada, tokens inyectados en Vercel.

### Pasos pendientes para que WhatsApp responda a clientes reales:
1. Entrar a Meta for Developers.
2. Rellenar información básica de la app (URL de políticas, ícono).
3. Cambiar el interruptor de "Modo Desarrollo" a **"Activo" (Live)**.
*(Con eso, Meta dejará de bloquear los mensajes de tu celular y llegarán al CRM)*.

---

# Plan de Mejora: Login y Rediseño del CRM

El objetivo es añadir un sistema de autenticación seguro, rediseñar la interfaz basándonos en tus capturas de diseño (Sidebar oscuro, acentos verdes, limpieza visual), y estructurar la navegación.

> [!IMPORTANT]
> **User Review Required**
> Necesito tu aprobación sobre este plan antes de empezar a programar. Verifica si la estructura de tablas y el flujo de login te parece correcto.

## Open Questions

1. **Autenticación:** ¿Quieres que cualquier persona pueda registrarse libremente (Crear Cuenta), o prefieres que tú (como Administrador) crees las cuentas manualmente en Supabase y los empleados solo tengan pantalla de Iniciar Sesión?
2. **Asignación:** Por ahora, ¿todos los agentes verán todos los chats, o quieres que cada agente solo vea los chats que se le asignen? (Recomiendo que todos vean todo por ahora para simplificar).

## Cambios en Base de Datos (Supabase)

Actualmente, las políticas de seguridad (RLS) están "abiertas" (`true`) para facilitar el desarrollo. Modificaremos esto:

1. Crearemos una tabla `profiles` (Perfiles/Agentes) vinculada al sistema de usuarios nativo de Supabase (`auth.users`).
2. Actualizaremos las políticas RLS de todas las tablas (`contacts`, `messages`, etc.) para que **solo usuarios autenticados** puedan leer o escribir datos.
   *Nota: El Webhook de Vercel no se verá afectado porque usa una clave maestra (Service Role Key) que ignora estas reglas.*

## Proposed Changes

### Frontend Components y Páginas

#### [NEW] src/pages/Login.jsx
- Pantalla de inicio de sesión moderna, fondo limpio, tarjeta central con inputs para Correo y Contraseña. 
- Lógica de autenticación con `supabase.auth.signInWithPassword()`.

#### [NEW] src/components/ProtectedRoute.jsx
- Componente que envuelve las rutas del CRM. Si el usuario no tiene sesión activa, lo redirige a `/login`.

#### [MODIFY] src/App.jsx
- Implementar `react-router-dom` (si no está ya configurado de forma robusta) para manejar `/login` y `/` (Dashboard).

#### [MODIFY] src/components/Sidebar.jsx
- Rediseño total basado en tus imágenes: Fondo oscuro (`bg-slate-900`), texto blanco/gris, íconos para cada módulo (Conversaciones, Contactos, Leads, Prompts), y acentos verdes para la pestaña activa.

#### [MODIFY] src/index.css / tailwind.config.js
- Configurar paleta de colores (Verde principal, fondo oscuro, etc.) para que coincida con tus mockups.

## Verification Plan

### Automated Tests
- Validar que al intentar entrar a `localhost:5173/` sin sesión, redirija a `/login`.
- Validar que `supabase.auth.getUser()` devuelva la sesión correcta tras el login.

### Manual Verification
- Iniciar sesión con una cuenta de prueba.
- Verificar que el sidebar nuevo sea responsivo y luzca idéntico a los diseños propuestos.
- Enviar un mensaje de prueba al webhook local y verificar que aparezca en el panel autenticado en tiempo real.
