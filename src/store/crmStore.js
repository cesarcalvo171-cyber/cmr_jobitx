import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useCRMStore = create((set, get) => ({
  // --- ESTADOS ---
  activeTab: 'conversaciones',
  chats: [],
  clients: [],
  leads: [],
  activeChatId: null,
  searchQuery: '',
  loading: false,
  error: null,

  // --- ACCIONES GENERALES ---
  setActiveTab: (activeTab) => set({ activeTab }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  setActiveChatId: async (chatId) => {
    set({ activeChatId: chatId });
    if (!chatId) return;

    // Al seleccionar una conversación, marcamos unread_count como 0 en la BD
    try {
      await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', chatId);

      // Y actualizamos localmente
      set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      }));
    } catch (err) {
      console.error('Error al limpiar unread_count:', err);
    }
  },

  // --- CARGA DE DATOS (READS) ---

  // Cargar Chats y Conversaciones con Contactos y Mensajes
  fetchChats: async () => {
    set({ loading: true, error: null });
    try {
      // 1. Obtener todas las conversaciones
      const { data: convs, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          status,
          unread_count,
          last_message_at,
          contacts (
            id,
            name,
            phone,
            avatar,
            bot_enabled,
            blocked,
            tags,
            lead_score
          )
        `)
        .order('last_message_at', { ascending: false });

      if (convError) throw convError;

      // 2. Obtener mensajes para cada conversación
      const chatsWithMessages = await Promise.all(
        convs.map(async (c) => {
          const { data: msgs, error: msgError } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', c.id)
            .order('created_at', { ascending: true });

          if (msgError) throw msgError;

          const contact = c.contacts;
          const lastMsg = msgs[msgs.length - 1];

          return {
            id: c.id,
            contactId: contact ? contact.id : null,
            name: contact ? contact.name : 'Contacto Sin Nombre',
            avatar: contact ? contact.avatar || contact.name.substring(0, 2).toUpperCase() : '??',
            phone: contact ? contact.phone : '',
            email: contact ? `${contact.phone}@crm.local` : '', // Mock email si no existe campo
            lastMessage: lastMsg ? lastMsg.content : 'Sin mensajes',
            timestamp: c.last_message_at 
              ? new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
              : '',
            unreadCount: c.unread_count || 0,
            platform: 'WhatsApp',
            status: contact && contact.bot_enabled ? 'IA' : 'Humano',
            convStatus: c.status === 'snoozed' ? 'Pendiente' : c.status === 'archived' ? 'Cerrado' : 'En Ejecución',
            rawConvStatus: c.status || 'active',
            botEnabled: contact ? contact.bot_enabled : true,
            labels: contact ? contact.tags || [] : [],
            leadScore: contact ? contact.lead_score || 'cold' : 'cold',
            messages: msgs.map((m) => ({
              id: m.id,
              sender: m.role === 'user' ? 'client' : m.role === 'assistant' ? 'ia' : 'user',
              text: m.content,
              time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: m.status
            }))
          };
        })
      );

      set({ chats: chatsWithMessages, loading: false });
    } catch (err) {
      console.error('Error cargando chats:', err);
      set({ error: err.message, loading: false });
    }
  },

  // Actualizar Estado de Conversación (En Ejecución, Pendiente, Cerrado)
  updateConversationStatus: async (chatId, newFriendlyStatus) => {
    const dbStatus = newFriendlyStatus === 'Pendiente' ? 'snoozed'
      : newFriendlyStatus === 'Cerrado' ? 'archived'
      : 'active';

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: dbStatus })
        .eq('id', chatId);

      if (error) throw error;

      set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId 
            ? { ...chat, convStatus: newFriendlyStatus, rawConvStatus: dbStatus } 
            : chat
        ),
        clients: state.clients.map((client) => {
          const chat = state.chats.find(c => c.id === chatId);
          if (chat && chat.phone === client.phone) {
            return { ...client, convStatus: newFriendlyStatus };
          }
          return client;
        })
      }));
    } catch (err) {
      console.error('Error al actualizar estado de la conversación:', err);
    }
  },

  // Cargar Contactos (Clientes)
  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedClients = data.map((c) => {
        const matchingChat = get().chats.find((chat) => chat.phone === c.phone || chat.contactId === c.id);
        return {
          id: c.id,
          chatId: matchingChat ? matchingChat.id : null,
          name: c.name,
          phone: c.phone,
          email: `${c.phone}@crm.local`,
          status: c.lead_score === 'hot' ? 'Cerrado - Ganado' : c.lead_score === 'warm' ? 'Demo Programada' : 'Nuevo',
          leadScore: c.lead_score || 'cold',
          convStatus: matchingChat ? matchingChat.convStatus : 'En Ejecución',
          botEnabled: c.bot_enabled !== false,
          creationDate: new Date(c.created_at).toISOString().split('T')[0],
          labels: c.tags || [],
          notes: c.blocked ? '⚠️ CONTACTO BLOQUEADO' : 'Gestionado vía TalosFlow.',
          messages: matchingChat ? matchingChat.messages : []
        };
      });

      set({ clients: formattedClients, loading: false });
    } catch (err) {
      console.error('Error cargando clientes:', err);
      set({ error: err.message, loading: false });
    }
  },

  // Cargar Oportunidades (Leads)
  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          score,
          reason,
          stage,
          value,
          contacts (
            id,
            name,
            phone
          )
        `);

      if (error) throw error;

      const formattedLeads = data.map((l) => ({
        id: l.id,
        contactId: l.contacts ? l.contacts.id : null,
        name: l.contacts ? l.contacts.name : 'Lead Anónimo',
        phone: l.contacts ? l.contacts.phone : '',
        monto: parseFloat(l.value) || 0,
        stage: l.stage || 'Nuevo',
        score: l.score || 'cold',
        reason: l.reason || '',
        avatarColor: l.score === 'hot' ? 'bg-emerald-100 text-emerald-700' : l.score === 'warm' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
      }));

      set({ leads: formattedLeads, loading: false });
    } catch (err) {
      console.error('Error cargando leads:', err);
      set({ error: err.message, loading: false });
    }
  },



  // --- OPERACIONES DE MUTACIONES (ESCRITURAS) ---

  // Enviar Mensaje (inserta en base de datos)
  sendMessage: async (chatId, text) => {
    const activeChat = get().chats.find(c => c.id === chatId);
    if (!activeChat) return;

    try {
      // 1. Insertar mensaje saliente como 'agent' en la base de datos
      const { data: newMsg, error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: chatId,
          role: 'agent',
          content: text,
          status: 'sent'
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // 2. Enviar el mensaje directamente hacia el Webhook de n8n
      fetch('https://mdter.app.n8n.cloud/webhook/enviar-humano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: activeChat.phone,
          text: text
        })
      }).catch(err => console.warn('Error enviando directamente a n8n:', err));

      // NOTA: El trigger de realtime actualizará los estados localmente, pero
      // actualizamos de forma optimista para que la interfaz se sienta instantánea
      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      set((state) => ({
        chats: state.chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              lastMessage: text,
              timestamp: timeNow,
              messages: [
                ...chat.messages,
                {
                  id: newMsg.id,
                  sender: 'user', // user en el chat representará al agente humano
                  text,
                  time: timeNow,
                  status: 'sent'
                }
              ]
            };
          }
          return chat;
        })
      }));
    } catch (err) {
      console.error('Error enviando mensaje:', err);
    }
  },

  // Activar/Desactivar Bot
  toggleBotStatus: async (chatId, statusType) => {
    const activeChat = get().chats.find(c => c.id === chatId);
    if (!activeChat) return;

    const botEnabled = statusType === 'IA';

    try {
      // 1. Obtener la conversación para saber el contact_id
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('contact_id')
        .eq('id', chatId)
        .single();

      if (convError) throw convError;

      // 2. Actualizar bot_enabled en la tabla contacts
      const { error: contactError } = await supabase
        .from('contacts')
        .update({ bot_enabled: botEnabled })
        .eq('id', conv.contact_id);

      if (contactError) throw contactError;

      // Actualizar localmente
      set((state) => ({
        chats: state.chats.map((chat) => 
          chat.id === chatId ? { ...chat, status: statusType } : chat
        )
      }));
    } catch (err) {
      console.error('Error al cambiar bot_enabled:', err);
    }
  },

  // Crear Cliente
  addClient: async (clientData) => {
    try {
      // 1. Insertar contacto con todos los campos disponibles
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          name: clientData.name,
          phone: clientData.phone,
          email: clientData.email || null,
          notes: clientData.notes || null,
          lead_score: clientData.status === 'Cerrado - Ganado' ? 'hot'
            : clientData.status === 'Demo Programada' ? 'warm' : 'cold',
          tags: clientData.labels || []
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // 2. Crear conversación automática para el nuevo contacto
      await supabase
        .from('conversations')
        .insert({ contact_id: contact.id });

      // Recargar datos
      await get().fetchChats();
      await get().fetchClients();
    } catch (err) {
      console.error('Error al añadir cliente:', err);
    }
  },

  // Eliminar Cliente
  deleteClient: async (clientId) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      await get().fetchChats();
      await get().fetchClients();
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
    }
  },

  // Eliminar Chat/Conversación completa
  deleteChat: async (chatId) => {
    try {
      const chat = get().chats.find(c => c.id === chatId);
      if (!chat) return;

      if (chat.contactId) {
        await supabase.from('contacts').delete().eq('id', chat.contactId);
      } else {
        await supabase.from('conversations').delete().eq('id', chatId);
      }

      set((state) => ({
        activeChatId: state.activeChatId === chatId ? null : state.activeChatId,
        chats: state.chats.filter(c => c.id !== chatId),
        clients: state.clients.filter(c => c.id !== chat.contactId)
      }));
    } catch (err) {
      console.error('Error al eliminar el chat:', err);
    }
  },

  // Mover Etapa Lead Kanban
  moveLead: async (leadId, nextStage) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ stage: nextStage })
        .eq('id', leadId);

      if (error) throw error;

      // Actualizar localmente
      set((state) => ({
        leads: state.leads.map((l) => 
          l.id === leadId ? { ...l, stage: nextStage } : l
        )
      }));
    } catch (err) {
      console.error('Error al mover lead:', err);
    }
  },

  // Crear Lead Kanban
  addLead: async (leadData) => {
    try {
      // 1. Buscar o crear contacto
      let { data: contact } = await supabase
        .from('contacts')
        .select('id')
        .eq('phone', leadData.phone)
        .maybeSingle();

      if (!contact) {
        const { data: newContact, error: cErr } = await supabase
          .from('contacts')
          .insert({
            name: leadData.name,
            phone: leadData.phone
          })
          .select()
          .single();
        if (cErr) throw cErr;
        contact = newContact;
      }

      // 2. Insertar Lead con monto numerico del prestamo
      const score = leadData.stage === 'Prestamo Cerrado' ? 'hot' 
        : leadData.stage === 'Prestamo Programado' ? 'warm' 
        : leadData.stage === 'En Proceso' ? 'warm'
        : 'cold';
      const { error: lErr } = await supabase
        .from('leads')
        .insert({
          contact_id: contact.id,
          stage: leadData.stage || 'Nuevo',
          value: parseFloat(leadData.monto) || 0,
          score,
          reason: leadData.reason || 'Prestamo solicitado via WhatsApp'
        });

      if (lErr) throw lErr;

      await get().fetchLeads();
    } catch (err) {
      console.error('Error al añadir lead:', err);
    }
  },

  // --- MANEJADORES DE REALTIME EVENTS ---
  
  handleRealtimeMessage: (payload) => {
    const newMessage = payload.new;
    const timeNow = new Date(newMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    set((state) => {
      let chatFound = false;
      const updatedChats = state.chats.map((chat) => {
        if (chat.id === newMessage.conversation_id) {
          chatFound = true;
          // Evitar duplicados si ya actualizamos optimísticamente
          if (chat.messages.some(m => m.id === newMessage.id)) {
            return chat;
          }
          
          return {
            ...chat,
            lastMessage: newMessage.content,
            timestamp: timeNow,
            unreadCount: newMessage.role === 'user' && state.activeChatId !== chat.id ? chat.unreadCount + 1 : chat.unreadCount,
            messages: [
              ...chat.messages,
              {
                id: newMessage.id,
                sender: newMessage.role === 'user' ? 'client' : newMessage.role === 'assistant' ? 'ia' : 'user',
                text: newMessage.content,
                time: timeNow,
                status: newMessage.status
              }
            ]
          };
        }
        return chat;
      });

      if (!chatFound) {
        // Si no se encuentra la conversación, recargar chats
        get().fetchChats();
        return {};
      }

      return { chats: updatedChats };
    });
  },

  // --- DEMO: Cargar conversación de prueba bot → humano ---
  loadDemoConversation: async () => {
    set({ loading: true });
    try {
      const DEMO_PHONE = '+50200000001';
      const DEMO_NAME  = 'Carlos Méndez (Demo)';

      // 1. Crear o reutilizar contacto demo
      let contact;
      const { data: existing } = await supabase
        .from('contacts')
        .select('id, name, bot_enabled')
        .eq('phone', DEMO_PHONE)
        .limit(1);

      if (existing && existing.length > 0) {
        contact = existing[0];
        // Resetear bot a activo para la demo
        await supabase.from('contacts').update({ bot_enabled: true }).eq('id', contact.id);
        contact.bot_enabled = true;
      } else {
        const { data: created } = await supabase
          .from('contacts')
          .insert({ name: DEMO_NAME, phone: DEMO_PHONE, bot_enabled: true, blocked: false, lead_score: 'warm', tags: ['demo'] })
          .select()
          .single();
        contact = created;
      }

      // 2. Cerrar conversaciones anteriores del contacto demo y crear nueva
      await supabase.from('conversations').update({ status: 'archived' }).eq('contact_id', contact.id);
      const { data: conv } = await supabase
        .from('conversations')
        .insert({ contact_id: contact.id, status: 'active', unread_count: 2 })
        .select()
        .single();

      // 3. Insertar mensajes de la demo (flujo bot → humano)
      const now = new Date();
      const t = (minusMinutes) => new Date(now.getTime() - minusMinutes * 60000).toISOString();

      const demoMessages = [
        { role: 'user',      content: 'Hola, buenos días. Quiero información sobre un préstamo personal.',                                                                     created_at: t(18) },
        { role: 'assistant', content: '¡Buenos días, Carlos! Soy el asistente virtual de TalosFlow Préstamos. Con mucho gusto te ayudo. ¿Qué monto necesitas?',               created_at: t(17) },
        { role: 'user',      content: 'Necesito $5,000 dólares. Es para un negocio.',                                                                                          created_at: t(16) },
        { role: 'assistant', content: 'Perfecto. Tenemos plazos de 6, 12 y 24 meses. ¿Cuál se adapta mejor a tu presupuesto?',                                                 created_at: t(15) },
        { role: 'user',      content: 'A 12 meses estaría bien. ¿Cuál sería la cuota mensual aproximada?',                                                                     created_at: t(14) },
        { role: 'assistant', content: 'Con $5,000 a 12 meses, la cuota aproximada sería de $458/mes con una tasa del 18% anual. ¿Te gustaría continuar con la solicitud?',     created_at: t(13) },
        { role: 'user',      content: 'Sí, me interesa. ¿Qué documentos necesito?',                                                                                            created_at: t(12) },
        { role: 'assistant', content: 'Necesitarás: DPI vigente, comprobante de ingresos (últimos 3 meses) y una referencia personal. ¿Tienes todos esos documentos?',         created_at: t(11) },
        { role: 'user',      content: 'Sí, los tengo todos. ¿Cómo procedo?',                                                                                                   created_at: t(10) },
        // --- AQUÍ EL ASESOR DESACTIVA EL BOT Y TOMA EL CONTROL ---
        { role: 'agent',     content: '¡Hola Carlos! Soy María, tu asesora personal. Vi tu solicitud y quiero ayudarte directamente. Tu perfil luce muy bien para el préstamo. 😊', created_at: t(8) },
        { role: 'user',      content: '¡Hola María! Qué bueno hablar con una persona. ¿Cuándo podría tener el dinero?',                                                        created_at: t(7) },
        { role: 'agent',     content: 'Si entregás los documentos hoy o mañana, podemos tenerte el desembolso en 48 horas hábiles. ¿Podés pasar por la oficina mañana a las 10am?', created_at: t(5) },
        { role: 'user',      content: 'Perfecto, ahí estaré. Muchas gracias.',                                                                                                  created_at: t(3) },
        { role: 'agent',     content: 'Con gusto Carlos. Te mando la dirección de la oficina por aquí. ¡Hasta mañana! 👋',                                                      created_at: t(1) },
      ];

      await supabase.from('messages').insert(
        demoMessages.map(m => ({ ...m, conversation_id: conv.id, status: 'received', whatsapp_message_id: null }))
      );

      // 4. Marcar contacto como bot desactivado (estado final de la demo)
      await supabase.from('contacts').update({ bot_enabled: false }).eq('id', contact.id);

      // 5. Recargar chats y navegar al demo
      await get().fetchChats();
      const updatedChats = get().chats;
      const demoChat = updatedChats.find(c => c.contactPhone === DEMO_PHONE || c.phone === DEMO_PHONE);
      if (demoChat) get().setActiveChatId(demoChat.id);

      set({ loading: false });
      return { success: true, conversationId: conv.id };
    } catch (err) {
      console.error('Error cargando demo:', err);
      set({ loading: false });
      return { success: false, error: err.message };
    }
  },

}));
