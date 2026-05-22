// api/cron/followup.js
// Vercel Serverless Function - Seguimiento automático de chats inactivos (Fase 7)

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente administrativo de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // Proteger endpoint con verificación de token (Seguridad Fase 8)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'talosflow_cron_secret';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    // 1. Obtener todas las conversaciones activas que no hayan tenido mensajes en las últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: inactiveConvs, error: convsError } = await supabase
      .from('conversations')
      .select(`
        id,
        contact_id,
        last_message_at,
        contacts (
          id,
          name,
          phone,
          blocked,
          bot_enabled
        )
      `)
      .eq('status', 'active')
      .lt('last_message_at', oneDayAgo);

    if (convsError) throw convsError;

    if (!inactiveConvs || inactiveConvs.length === 0) {
      return res.status(200).json({ message: 'No hay conversaciones inactivas para seguimiento.' });
    }

    const processedFollowups = [];

    // 2. Iterar sobre cada conversación y enviar seguimiento personalizado si corresponde
    for (const conv of inactiveConvs) {
      const contact = conv.contacts;
      
      // Saltarse si el contacto está bloqueado, no tiene el bot habilitado o no tiene teléfono
      if (!contact || contact.blocked || !contact.bot_enabled || !contact.phone) {
        continue;
      }

      // Evitar enviar seguimientos múltiples muy seguidos comprobando si el último mensaje fue un follow-up
      const { data: lastMessages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (msgError) continue;

      // Si el último mensaje es un asistente/agente y contiene palabras de seguimiento comunes, no insistir de nuevo
      const isAlreadyFollowedUp = lastMessages && lastMessages.length > 0 && 
        lastMessages[0].role !== 'user' && 
        (lastMessages[0].content.includes('seguimiento') || lastMessages[0].content.includes('¿sigues ahí?'));

      if (isAlreadyFollowedUp) {
        continue;
      }

      // 3. Generar mensaje de seguimiento inteligente basado en el historial
      const history = lastMessages ? [...lastMessages].reverse() : [];
      
      let systemPrompt = `Eres TalosBot, asistente de ventas de TalosFlow. El cliente ha estado inactivo por más de 24 horas. Redacta un mensaje de seguimiento muy corto, natural, amigable e inspirador en español (máximo 2 líneas) preguntando si tiene alguna duda adicional o si le gustaría agendar una demo gratuita con Erik Taveras.`;
      
      const openRouterMessages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content
        }))
      ];

      const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
      let followupText = '';

      try {
        const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': 'https://talosflow.crm',
            'X-Title': 'TalosFlow CRM'
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-chat',
            messages: openRouterMessages,
            temperature: 0.5
          })
        });

        const orJson = await orResponse.json();
        followupText = orJson.choices?.[0]?.message?.content || '';
      } catch (err) {
        console.error(`Error generando followup para ${contact.name}:`, err);
        // Fallback genérico amigable
        followupText = `¡Hola ${contact.name}! Te escribo para ver si pudiste revisar la información o si tienes alguna duda adicional. Recuerda que puedes agendar una demo comercial con Erik Taveras cuando gustes: https://calendly.com/talosflow/demo-gratuita`;
      }

      if (followupText) {
        // 4. Enviar mensaje por WhatsApp Cloud API
        const waToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        let waSentMsgId = `followup_sim_${Date.now()}`;

        if (waToken && waPhoneId) {
          try {
            const metaResponse = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${waToken}`
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: contact.phone,
                type: 'text',
                text: { body: followupText }
              })
            });
            const metaJson = await metaResponse.json();
            if (metaJson.messages?.[0]?.id) {
              waSentMsgId = metaJson.messages[0].id;
            }
          } catch (err) {
            console.error(`Error de envío Meta para ${contact.name}:`, err);
          }
        }

        // 5. Insertar mensaje en Supabase
        await supabase.from('messages').insert({
          conversation_id: conv.id,
          role: 'assistant',
          content: followupText,
          whatsapp_message_id: waSentMsgId,
          status: 'sent'
        });

        // Registrar en logs de automatización
        await supabase.from('automation_logs').insert({
          type: 'followup_sent',
          payload: { contact_id: contact.id, contact_name: contact.name, phone: contact.phone, content: followupText },
          status: 'success'
        });

        processedFollowups.push({ contact: contact.name, message: followupText });
      }
    }

    return res.status(200).json({ 
      success: true, 
      processed_count: processedFollowups.length,
      processed: processedFollowups 
    });

  } catch (error) {
    console.error('🚨 Error crítico en Cron de Followup:', error);
    
    // Registrar error
    try {
      await supabase.from('automation_logs').insert({
        type: 'cron_followup_failed',
        payload: { error: error.message },
        status: 'failed'
      });
    } catch (err) {
      console.error('Error al registrar log de falla en Cron:', err);
    }

    return res.status(500).json({ error: 'Error interno de cron' });
  }
}
