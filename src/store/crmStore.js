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
            labels: contact ? contact.tags || [] : [],
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

  // Cargar Contactos (Clientes)
  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedClients = data.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: `${c.phone}@crm.local`,
        status: c.lead_score === 'hot' ? 'Cerrado - Ganado' : c.lead_score === 'warm' ? 'Demo Programada' : 'Nuevo',
        creationDate: new Date(c.created_at).toISOString().split('T')[0],
        labels: c.tags || [],
        notes: c.blocked ? '⚠️ CONTACTO BLOQUEADO' : 'Gestionado vía TalosFlow.'
      }));

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
        name: l.contacts ? l.contacts.name : 'Lead Anónimo',
        company: l.contacts ? `WhatsApp ${l.contacts.phone}` : 'Ventas',
        value: l.value || '$0/mes',
        stage: l.stage || 'Nuevo',
        phone: l.contacts ? l.contacts.phone : '',
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

      // 2. Disparar llamada REST a nuestra WhatsApp Cloud API para que el mensaje llegue al teléfono real.
      // Si el entorno local no tiene token, fallará silenciosamente o se simulará
      fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [{
            id: 'agent_sent',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: { phone_number_id: 'agent_phone' },
                contacts: [{ profile: { name: 'Agente' }, wa_id: activeChat.phone }],
                messages: [{
                  id: newMsg.id,
                  from: 'agent',
                  text: { body: text },
                  timestamp: Math.floor(Date.now() / 1000)
                }]
              },
              field: 'messages'
            }]
          }]
        })
      }).catch(err => console.warn('Llamada a Webhook WhatsApp simulada/fallida:', err));

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
      // 1. Insertar contacto
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          name: clientData.name,
          phone: clientData.phone,
          lead_score: clientData.status === 'Cerrado - Ganado' ? 'hot' : clientData.status === 'Demo Programada' ? 'warm' : 'cold',
          tags: clientData.labels
        })
        .select()
        .single();

      if (contactError) throw contactError;

      // 2. Crear conversación automática
      await supabase
        .from('conversations')
        .insert({
          contact_id: contact.id
        });

      // Recargar base
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

      // 2. Insertar Lead
      const score = leadData.stage === 'Cerrado' ? 'hot' : leadData.stage === 'Demo Programada' ? 'warm' : 'cold';
      const { error: lErr } = await supabase
        .from('leads')
        .insert({
          contact_id: contact.id,
          stage: leadData.stage,
          value: leadData.value,
          score,
          reason: 'Creado desde pipeline manual'
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
  }
}));
