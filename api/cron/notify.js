// api/cron/notify.js
// Vercel Serverless Function - Resumen diario de Leads Calientes (Fase 7)

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
    // 1. Buscar leads 'hot' creados en las últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: hotLeads, error: leadsError } = await supabase
      .from('leads')
      .select(`
        id,
        score,
        reason,
        stage,
        value,
        created_at,
        contacts (
          id,
          name,
          phone,
          ad_source
        )
      `)
      .eq('score', 'hot')
      .gt('created_at', oneDayAgo);

    if (leadsError) throw leadsError;

    // 2. Obtener métricas generales para enriquecer el correo
    const { count: totalContacts } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    const { count: totalHotLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('score', 'hot');

    const { count: totalConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // 3. Preparar cuerpo del correo
    const resendKey = process.env.RESEND_API_KEY || '';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@crm.local';

    if (!resendKey) {
      console.warn('⚠️ Resend API Key no configurada. Omitiendo envío de correo de resumen.');
      return res.status(200).json({ 
        success: true, 
        message: 'Resumen diario compilado (sin enviar correo por falta de API Key)',
        stats: { new_hot_leads: hotLeads?.length || 0, total_contacts: totalContacts }
      });
    }

    let leadsHtmlList = '';
    if (hotLeads && hotLeads.length > 0) {
      leadsHtmlList = hotLeads.map(l => `
        <div style="padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px; background-color: #f8fafc;">
          <h4 style="margin: 0 0 5px 0; color: #0f172a; font-size: 14px;">🔥 ${l.contacts?.name || 'Lead Anónimo'}</h4>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #475569;">
            <strong>Teléfono:</strong> ${l.contacts?.phone || 'No registrado'} | 
            <strong>Origen:</strong> ${l.contacts?.ad_source || 'Orgánico'}
          </p>
          <p style="margin: 0 0 5px 0; font-size: 12px; color: #475569;">
            <strong>Valor Est.:</strong> <span style="color: #059669; font-weight: bold;">${l.value || '$0'}</span> | 
            <strong>Estado Kanban:</strong> ${l.stage}
          </p>
          <p style="margin: 0; font-size: 12px; color: #64748b; font-style: italic;">
            <strong>Razón:</strong> ${l.reason || 'Sin detalles'}
          </p>
        </div>
      `).join('');
    } else {
      leadsHtmlList = `
        <div style="padding: 20px; text-align: center; border: 1px dashed #cbd5e1; border-radius: 12px; color: #94a3b8; font-size: 13px;">
          No se registraron nuevos Leads Calientes (HOT) en las últimas 24 horas.
        </div>
      `;
    }

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #334155;">
        <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; margin-top: 0; font-size: 20px; font-weight: 800;">
          📊 TalosFlow CRM — Resumen Diario de Ventas
        </h2>
        
        <p style="font-size: 14px; line-height: 1.5; color: #475569;">
          Aquí tienes el reporte diario de oportunidades comerciales capturadas por el Agente IA de WhatsApp.
        </p>

        <!-- Bloque de estadísticas -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr>
            <td style="padding: 10px; background-color: #f0fdf4; border: 1px solid #dcfce7; text-align: center; border-radius: 8px; width: 33%;">
              <span style="font-size: 18px; font-weight: 800; color: #166534; display: block;">${hotLeads?.length || 0}</span>
              <strong style="color: #15803d; font-size: 10px; text-transform: uppercase;">Nuevos HOT</strong>
            </td>
            <td style="padding: 10px; background-color: #fdf2f8; border: 1px solid #fce7f3; text-align: center; border-radius: 8px; width: 33%;">
              <span style="font-size: 18px; font-weight: 800; color: #9d174d; display: block;">${totalHotLeads || 0}</span>
              <strong style="color: #be185d; font-size: 10px; text-transform: uppercase;">Total Leads</strong>
            </td>
            <td style="padding: 10px; background-color: #eff6ff; border: 1px solid #dbeafe; text-align: center; border-radius: 8px; width: 33%;">
              <span style="font-size: 18px; font-weight: 800; color: #1e40af; display: block;">${totalConversations || 0}</span>
              <strong style="color: #1d4ed8; font-size: 10px; text-transform: uppercase;">Chats Activos</strong>
            </td>
          </tr>
        </table>

        <h3 style="color: #0f172a; font-size: 14px; font-weight: 700; margin: 25px 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">
          🔥 Nuevos Leads Calientes (Últimas 24h)
        </h3>
        
        ${leadsHtmlList}

        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 11px; color: #94a3b8;">
          Este es un correo automático enviado por el motor de Automatizaciones de TalosFlow CRM.<br/>
          Dirección del Administrador: ${adminEmail}
        </div>
      </div>
    `;

    // 4. Despachar correo vía Resend
    const mailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`
      },
      body: JSON.stringify({
        from: 'TalosFlow CRM <onboarding@resend.dev>',
        to: adminEmail,
        subject: `📊 Reporte Diario TalosFlow: ${hotLeads?.length || 0} Nuevo(s) Lead(s) Caliente(s)`,
        html: emailHtml
      })
    });

    const mailJson = await mailRes.json();

    // 5. Registrar en logs
    await supabase.from('automation_logs').insert({
      type: 'daily_summary_email',
      payload: { 
        new_hot_leads_count: hotLeads?.length || 0,
        total_contacts: totalContacts,
        mail_response: mailJson
      },
      status: 'success'
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Resumen diario enviado exitosamente.',
      stats: { new_hot_leads: hotLeads?.length || 0 }
    });

  } catch (error) {
    console.error('🚨 Error crítico en Cron de Notificaciones:', error);
    
    // Registrar error
    try {
      await supabase.from('automation_logs').insert({
        type: 'cron_notify_failed',
        payload: { error: error.message },
        status: 'failed'
      });
    } catch (err) {
      console.error('Error al registrar log de falla en Cron Notify:', err);
    }

    return res.status(500).json({ error: 'Error interno de cron notify' });
  }
}
