// api/webhook.js
// Vercel Serverless Function - Webhook de WhatsApp e Inteligencia Artificial (OpenRouter)

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente administrativo de Supabase (Bypass RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  // ==========================================
  // FASE 8: VALIDACIÓN Y SEGURIDAD
  // ==========================================

  // --- 1. GET: VERIFICACIÓN DEL WEBHOOK DE META ---
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'talosflow_secret_token';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook de Meta verificado con éxito.');
      return res.status(200).send(challenge);
    } else {
      console.error('❌ Error de validación de verify_token de WhatsApp.');
      return res.status(403).json({ error: 'Token de verificación inválido' });
    }
  }

  // --- 2. POST: RECEPCIÓN DE MENSAJES ---
  if (req.method === 'POST') {
    const body = req.body;

    // Registrar logs de auditoría para seguridad
    try {
      await supabase.from('automation_logs').insert({
        type: 'webhook_received',
        payload: body,
        status: 'received'
      });
    } catch (err) {
      console.error('Error guardando logs de webhook:', err);
    }

    // Verificar estructura del webhook de WhatsApp
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return res.status(400).json({ error: 'Payload de webhook no soportado' });
    }

    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      // Si no es un evento de mensaje entrante (ej. estado de entregado/leído), responder 200
      if (!message || !contact) {
        // Manejar receipts (entregado/leído)
        const statusUpdate = value?.statuses?.[0];
        if (statusUpdate) {
          const msgId = statusUpdate.id;
          const status = statusUpdate.status; // 'delivered', 'read', etc.

          // Actualizar estado en Supabase
          await supabase
            .from('messages')
            .update({ status })
            .eq('whatsapp_message_id', msgId);
        }
        return res.status(200).json({ success: true, message: 'Evento de estado procesado' });
      }

      // Extraer datos del mensaje
      const fromPhone = message.from;
      const contactName = contact.profile?.name || 'Cliente WhatsApp';
      const textContent = message.text?.body || '';
      const waMsgId = message.id;

      if (!textContent.trim()) {
        return res.status(200).json({ success: true, message: 'Mensaje sin texto omitido' });
      }

      // ==========================================
      // FASE 3: PERSISTENCIA Y FLUJO SUPABASE
      // ==========================================

      // A. Buscar o Crear Contacto
      let { data: dbContact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', fromPhone)
        .maybeSingle();

      if (contactError) throw contactError;

      if (!dbContact) {
        const { data: newContact, error: cErr } = await supabase
          .from('contacts')
          .insert({
            name: contactName,
            phone: fromPhone,
            lead_score: 'cold',
            bot_enabled: true
          })
          .select()
          .single();

        if (cErr) throw cErr;
        dbContact = newContact;
      }

      // Si el contacto está bloqueado en el CRM, ignorar mensaje
      if (dbContact.blocked) {
        return res.status(200).json({ success: true, message: 'Contacto bloqueado' });
      }

      // B. Buscar o Crear Conversación Activa
      let { data: dbConv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('contact_id', dbContact.id)
        .eq('status', 'active')
        .maybeSingle();

      if (convError) throw convError;

      if (!dbConv) {
        const { data: newConv, error: cvErr } = await supabase
          .from('conversations')
          .insert({
            contact_id: dbContact.id,
            status: 'active',
            unread_count: 1
          })
          .select()
          .single();

        if (cvErr) throw cvErr;
        dbConv = newConv;
      }

      // Evitar duplicados de webhooks repetidos por Meta
      const { data: existingMsg } = await supabase
        .from('messages')
        .select('id')
        .eq('whatsapp_message_id', waMsgId)
        .maybeSingle();

      if (existingMsg) {
        return res.status(200).json({ success: true, message: 'Mensaje duplicado ya procesado' });
      }

      // C. Registrar Mensaje del Usuario
      const { error: msgInsertError } = await supabase
        .from('messages')
        .insert({
          conversation_id: dbConv.id,
          role: 'user',
          content: textContent,
          whatsapp_message_id: waMsgId,
          status: 'read'
        });

      if (msgInsertError) throw msgInsertError;

      // ==========================================
      // FASE 5: AGENTE IA (OPENROUTER / DEEPSEEK)
      // ==========================================
      if (dbContact.bot_enabled) {
        // 1. Obtener historial reciente para memoria de conversación (últimos 8 mensajes)
        const { data: history } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', dbConv.id)
          .order('created_at', { ascending: true })
          .limit(8);

        // 2. Obtener Prompt del Sistema desde configuraciones
        let systemPrompt = "Eres TalosBot, un asistente de ventas de TalosFlow. Responde de forma muy corta, natural, en español, y persuasiva para agendar una demo.";
        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'ai_agent_settings')
          .maybeSingle();

        if (settingsData?.value?.system_prompt) {
          systemPrompt = settingsData.value.system_prompt;
        }

        // 3. Mapear mensajes al formato estándar de OpenRouter
        const openRouterMessages = [
          { role: 'system', content: systemPrompt },
          ...history.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        ];

        // 4. Llamada a OpenRouter API (DeepSeek V3)
        const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
        let botResponseText = '';

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
              temperature: settingsData?.value?.temperature || 0.4
            })
          });

          const orJson = await orResponse.json();
          botResponseText = orJson.choices?.[0]?.message?.content || '';
        } catch (err) {
          console.error('Error llamando a OpenRouter:', err);
          // Fallback en caso de corte de API
          botResponseText = `Hola ${contactName}, he recibido tu consulta. Erik Taveras se pondrá en contacto contigo en breve para darte soporte personalizado.`;
        }

        if (botResponseText) {
          // 5. Enviar mensaje de vuelta a WhatsApp mediante Meta API
          const waToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
          const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

          let waSentMsgId = `simulated_${Date.now()}`;

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
                  to: fromPhone,
                  type: 'text',
                  text: { body: botResponseText }
                })
              });
              const metaJson = await metaResponse.json();
              if (metaJson.messages?.[0]?.id) {
                waSentMsgId = metaJson.messages[0].id;
              }
            } catch (err) {
              console.error('Error enviando mensaje por Meta API:', err);
            }
          }

          // 6. Persistir respuesta de IA en Supabase
          await supabase.from('messages').insert({
            conversation_id: dbConv.id,
            role: 'assistant',
            content: botResponseText,
            whatsapp_message_id: waSentMsgId,
            status: 'sent'
          });

          // ==========================================
          // FASE 6 & 7: LEAD SCORING Y EMAIL ALERTS
          // ==========================================
          
          // Evaluar intenciones y contar número de mensajes
          const msgCount = history.length + 2; // + mensaje entrante y saliente
          
          if (msgCount >= 3) {
            let score = 'cold';
            let reason = 'Análisis automático de conversación.';
            
            const lowerBotMsg = botResponseText.toLowerCase();
            const lowerUserMsg = textContent.toLowerCase();

            // Calificar como HOT si hay intención firme de demo o compra
            if (
              lowerUserMsg.includes('demo') || 
              lowerUserMsg.includes('reunion') || 
              lowerUserMsg.includes('calendly') || 
              lowerUserMsg.includes('comprar') ||
              lowerUserMsg.includes('precio')
            ) {
              score = 'hot';
              reason = 'Cliente solicitó precios, demo o agendamiento.';
            } else if (lowerUserMsg.length > 20) {
              score = 'warm';
              reason = 'Lead interactuando activamente con detalles.';
            }

            // A. Guardar lead score automáticamente en contactos
            await supabase
              .from('contacts')
              .update({ lead_score: score })
              .eq('id', dbContact.id);

            // B. Si es HOT, persistir en la tabla leads y notificar vía Resend Email
            if (score === 'hot') {
              const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('contact_id', dbContact.id)
                .maybeSingle();

              if (!existingLead) {
                // Registrar lead en embudo
                await supabase.from('leads').insert({
                  contact_id: dbContact.id,
                  score: 'hot',
                  reason: reason,
                  stage: 'Demo Programada',
                  value: '$120/mes'
                });

                // Enviar email vía Resend API
                const resendKey = process.env.RESEND_API_KEY || '';
                const adminEmail = process.env.ADMIN_EMAIL || 'admin@crm.local';

                if (resendKey) {
                  try {
                    await fetch('https://api.resend.com/emails', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${resendKey}`
                      },
                      body: JSON.stringify({
                        from: 'TalosFlow CRM <onboarding@resend.dev>',
                        to: adminEmail,
                        subject: `🔥 ¡Nuevo Lead Caliente: ${contactName}!`,
                        html: `
                          <h3>¡Alerta de Venta en TalosFlow!</h3>
                          <p>El Agente IA ha calificado a <strong>${contactName}</strong> como un prospecto <strong>HOT</strong>.</p>
                          <ul>
                            <li><strong>Teléfono:</strong> ${fromPhone}</li>
                            <li><strong>Fase:</strong> Demo Programada</li>
                            <li><strong>Razón de Calificación:</strong> ${reason}</li>
                          </ul>
                          <p>Ingresa al CRM de inmediato para continuar el cierre.</p>
                        `
                      })
                    });
                  } catch (mailErr) {
                    console.error('Error enviando alerta por Resend:', mailErr);
                  }
                }
              }
            }
          }
        }
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('🚨 Error crítico en Webhook:', error);
      
      // Guardar log de falla
      try {
        await supabase.from('automation_logs').insert({
          type: 'webhook_failed',
          payload: { error: error.message, body },
          status: 'failed'
        });
      } catch (logErr) {
        console.error('Error guardando logs de falla:', logErr);
      }

      return res.status(500).json({ error: 'Error interno en el servidor' });
    }
  }

  // Métodos no permitidos
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Método ${req.method} no permitido`);
}
