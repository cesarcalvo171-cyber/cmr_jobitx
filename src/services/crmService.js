import { supabase } from '../lib/supabase';

export const crmService = {
  // --- GESTIÓN DE AJUSTES AGENTE IA ---
  
  // Obtener configuraciones del Agente IA
  getAISettings: async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'ai_agent_settings')
        .maybeSingle();

      if (error) throw error;
      return data ? data.value : null;
    } catch (err) {
      console.error('Error al obtener configuraciones del Agente IA:', err);
      return null;
    }
  },

  // Guardar configuraciones del Agente IA
  saveAISettings: async (settings) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'ai_agent_settings',
          value: settings
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error al guardar configuraciones del Agente IA:', err);
      return false;
    }
  },

  // --- OTRAS OPERACIONES DE CONTACTOS ---

  // Bloquear o desbloquear contacto
  setBlockStatus: async (contactId, blocked) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ blocked })
        .eq('id', contactId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error al cambiar bloqueo de contacto:', err);
      return false;
    }
  },

  // Gestionar Etiquetas
  updateContactTags: async (contactId, tags) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ tags })
        .eq('id', contactId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error al actualizar etiquetas de contacto:', err);
      return false;
    }
  },

  // Gestionar Lead Score
  updateContactLeadScore: async (contactId, leadScore) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({ lead_score: leadScore })
        .eq('id', contactId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error al calificar contacto:', err);
      return false;
    }
  }
};
