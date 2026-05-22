// api/webhook.js
// Vercel Serverless Function — Webhook de WhatsApp + IA (OpenRouter/DeepSeek)

import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con service_role (bypass RLS) para el backend
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {

  // ─── GET: Verificación del Webhook de Meta ──────────────────────────────────
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'talosflow_secret_2025';

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('✅ Webhook de Meta verificado con éxito.');
      return res.status(200).send(challenge);
    }
    console.error('❌ Token de verificación inválido.');
    return res.status(403).json({ error: 'Token de verificación inválido' });
  }

  // ─── POST: Recepción de mensajes entrantes ───────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body;

    // Registrar log de auditoría
    try {
      await supabase.from('automation_logs').insert({
        type: 'webhook_received',
        payload: body,
        status: 'received'
      });
    } catch (err) {
      console.error('Error guardando log de webhook:', err);
    }

    // Validar estructura del payload de WhatsApp
    if (!body.object || body.object !== 'whatsapp_business_account') {
      return res.status(400).json({ error: 'Payload no soportado' });
    }

    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      // Manejar receipts de estado (delivered, read)
      if (!message || !contact) {
        const statusUpdate = value?.statuses?.[0];
        if (statusUpdate) {
          await supabase
            .from('messages')
            .update({ status: statusUpdate.status })
            .eq('whatsapp_message_id', statusUpdate.id);
        }
        return res.status(200).json({ success: true, message: 'Estado procesado' });
      }

      const fromPhone = message.from;
      const contactName = contact.profile?.name || 'Cliente WhatsApp';
      const textContent = message.text?.body || '';
      const waMsgId = message.id;

      if (!textContent.trim()) {
        return res.status(200).json({ success: true, message: 'Mensaje sin texto omitido' });
      }

      // ─── A. Buscar o crear contacto ──────────────────────────────────────────
      let { data: dbContact, error: contactError } = await supabase
        .from('contacts')
        .select('*')
        .eq('phone', fromPhone)
        .maybeSingle();

      if (contactError) throw contactError;

      if (!dbContact) {
        const { data: newContact, error: cErr } = await supabase
          .from('contacts')
          .insert({ name: contactName, phone: fromPhone, lead_score: 'cold', bot_enabled: true })
          .select()
          .single();
        if (cErr) throw cErr;
        dbContact = newContact;
      }

      if (dbContact.blocked) {
        return res.status(200).json({ success: true, message: 'Contacto bloqueado' });
      }

      // ─── B. Buscar o crear conversación activa ───────────────────────────────
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
          .insert({ contact_id: dbContact.id, status: 'active', unread_count: 1 })
          .select()
          .single();
        if (cvErr) throw cvErr;
        dbConv = newConv;
      }

      // Evitar duplicados de webhook repetidos por Meta
      const { data: existingMsg } = await supabase
        .from('messages')
        .select('id')
        .eq('whatsapp_message_id', waMsgId)
        .maybeSingle();

      if (existingMsg) {
        return res.status(200).json({ success: true, message: 'Duplicado ya procesado' });
      }

      // ─── C. Registrar mensaje del usuario ────────────────────────────────────
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

      // ─── D. Agente IA (solo si bot_enabled) ──────────────────────────────────
      if (dbContact.bot_enabled) {
        // 1. Historial reciente (memoria de conversación)
        const { data: history } = await supabase
          .from('messages')
          .select('role, content')
          .eq('conversation_id', dbConv.id)
          .order('created_at', { ascending: true })
          .limit(10);

        // 2. Obtener system prompt desde Supabase settings
        let systemPrompt = 'Eres TalosBot, asistente de ventas de TalosFlow. Responde de forma corta, natural y en español para agendar una demo.';
        let aiTemperature = 0.4;

        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'ai_agent_settings')
          .maybeSingle();

        if (settingsData?.value?.system_prompt) systemPrompt = settingsData.value.system_prompt;
        if (settingsData?.value?.temperature !== undefined) aiTemperature = settingsData.value.temperature;

        // Si el agente está desactivado desde la UI, saltar respuesta IA
        if (settingsData?.value?.active === false) {
          return res.status(200).json({ success: true });
        }

        // 3. Llamada a OpenRouter
        const openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
        let botResponseText = '';

        try {
          const orResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${openRouterApiKey}`,
              'HTTP-Referer': 'https://cmr-phi.vercel.app',
              'X-Title': 'TalosFlow CRM'
            },
            body: JSON.stringify({
              model: settingsData?.value?.model || 'deepseek/deepseek-chat',
              messages: [
                { role: 'system', content: systemPrompt },
                ...(history || []).map(m => ({
                  role: m.role === 'user' ? 'user' : 'assistant',
                  content: m.content
                }))
              ],
              temperature: aiTemperature,
              max_tokens: settingsData?.value?.max_tokens || 500
            })
          });

          const orJson = await orResponse.json();
          botResponseText = orJson.choices?.[0]?.message?.content || '';
        } catch (err) {
          console.error('Error con OpenRouter:', err);
          botResponseText = `Hola ${contactName}, he recibido tu mensaje. Erik Taveras te contactará pronto para brindarte soporte personalizado.`;
        }

        if (botResponseText) {
          // 4. Enviar respuesta por WhatsApp Cloud API
          const waToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
          const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
          let waSentMsgId = `bot_${Date.now()}`;

          if (waToken && waPhoneId) {
            try {
              const metaRes = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
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
              const metaJson = await metaRes.json();
              if (metaJson.messages?.[0]?.id) waSentMsgId = metaJson.messages[0].id;
            } catch (err) {
              console.error('Error enviando mensaje por Meta API:', err);
            }
          }

          // 5. Persistir respuesta IA en Supabase
          await supabase.from('messages').insert({
            conversation_id: dbConv.id,
            role: 'assistant',
            content: botResponseText,
            whatsapp_message_id: waSentMsgId,
            status: 'sent'
          });

          // ─── E. Lead Scoring Automático ─────────────────────────────────────
          const msgCount = (history?.length || 0) + 2;
          if (msgCount >= 3) {
            let score = 'cold';
            let reason = 'Análisis automático de conversación.';
            const lowerUser = textContent.toLowerCase();

            if (
              lowerUser.includes('demo') ||
              lowerUser.includes('reunion') ||
              lowerUser.includes('precio') ||
              lowerUser.includes('comprar') ||
              lowerUser.includes('contratar') ||
              lowerUser.includes('calendly')
            ) {
              score = 'hot';
              reason = 'Cliente solicitó precios, demo o agendamiento.';
            } else if (lowerUser.length > 20) {
              score = 'warm';
              reason = 'Lead interactuando activamente.';
            }

            // Actualizar lead_score en contacts
            await supabase.from('contacts').update({ lead_score: score }).eq('id', dbContact.id);

            // Si es HOT → registrar en leads y enviar email de alerta
            if (score === 'hot') {
              const { data: existingLead } = await supabase
                .from('leads')
                .select('id')
                .eq('contact_id', dbContact.id)
                .maybeSingle();

              if (!existingLead) {
                await supabase.from('leads').insert({
                  contact_id: dbContact.id,
                  score: 'hot',
                  reason,
                  stage: 'Demo Programada',
                  value: '$120/mes'
                });

                // Alerta por email (Resend)
                const resendKey = process.env.RESEND_API_KEY || '';
                const adminEmail = process.env.ADMIN_EMAIL || '';
                if (resendKey && adminEmail) {
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
                          <h3>🔥 ¡Alerta de Lead Caliente — TalosFlow CRM!</h3>
                          <p>El Agente IA calificó a <strong>${contactName}</strong> como prospecto <strong>HOT</strong>.</p>
                          <ul>
                            <li><strong>Teléfono:</strong> ${fromPhone}</li>
                            <li><strong>Fase:</strong> Demo Programada</li>
                            <li><strong>Razón:</strong> ${reason}</li>
                          </ul>
                          <p>Ingresa al CRM para continuar el cierre: <a href="https://cmr-phi.vercel.app">cmr-phi.vercel.app</a></p>
                        `
                      })
                    });
                  } catch (mailErr) {
                    console.error('Error enviando alerta Resend:', mailErr);
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
      try {
        await supabase.from('automation_logs').insert({
          type: 'webhook_failed',
          payload: { error: error.message },
          status: 'failed',
          error_message: error.message
        });
      } catch (_) {}
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Método ${req.method} no permitido`);
}
