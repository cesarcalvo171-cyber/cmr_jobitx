import React, { useState, useEffect } from 'react';
import {
  MessageCircle, CheckCircle2, AlertCircle, RefreshCw,
  ShieldCheck, ExternalLink, Copy, CheckCheck, Globe,
  Zap, Key, Phone, Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://cmr-phi.vercel.app/api/webhook';
const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID || '58517405';
const VERIFY_TOKEN = import.meta.env.VITE_WHATSAPP_VERIFY_TOKEN || 'jobitx2026';

export default function WhatsappSetup() {
  const [logs, setLogs] = useState([]);
  const [copied, setCopied] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // ─── Cargar logs reales desde Supabase ──────────────────────────────────────
  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      const { data, error } = await supabase
        .from('automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (!error && data) {
        setRecentLogs(data);
      }
      setLoadingLogs(false);
    };

    fetchLogs();

    // Escuchar nuevos logs en tiempo real
    const channel = supabase
      .channel('webhook-logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'automation_logs' },
        (payload) => {
          setRecentLogs(prev => [payload.new, ...prev].slice(0, 30));
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ text, id }) => (
    <button
      onClick={() => copyToClipboard(text, id)}
      className="ml-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 shrink-0"
      title="Copiar"
    >
      {copied === id
        ? <CheckCheck className="h-3.5 w-3.5 text-green-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  const logBadge = (type) => {
    const map = {
      webhook_received: { cls: 'bg-indigo-50 text-indigo-700 border-indigo-100', label: 'WEBHOOK' },
      webhook_failed: { cls: 'bg-red-50 text-red-700 border-red-100', label: 'ERROR' },
      default: { cls: 'bg-slate-50 text-slate-600 border-slate-100', label: type?.toUpperCase() || 'LOG' }
    };
    const { cls, label } = map[type] || map.default;
    return (
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cls}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden select-none p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Canal WhatsApp</h1>
        <p className="text-sm text-slate-400 font-semibold mt-0.5">
          Configuración de WhatsApp Business API — Conectado vía Meta Developers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden min-h-0">

        {/* ─── Panel de Estado: API Activa ──────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-1">

          {/* Status Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Estado de la Conexión
              </h2>
              <span className="flex items-center gap-1.5 text-[11px] font-bold bg-green-50 text-green-700 border border-green-100 px-3 py-1.5 rounded-full">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                WhatsApp Cloud API Activa
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50/60 border border-green-100 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Mensajes Recibidos
                </span>
                <span className="text-2xl font-black text-green-700">
                  {recentLogs.filter(l => l.type === 'webhook_received').length}
                </span>
                <span className="text-[10px] text-green-600 font-semibold">últimos 30 eventos</span>
              </div>
              <div className="bg-red-50/60 border border-red-100 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Errores
                </span>
                <span className="text-2xl font-black text-red-600">
                  {recentLogs.filter(l => l.type === 'webhook_failed').length}
                </span>
                <span className="text-[10px] text-red-500 font-semibold">últimos 30 eventos</span>
              </div>
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Webhook
                </span>
                <span className="text-xs font-black text-indigo-700">Vercel</span>
                <span className="text-[10px] text-indigo-500 font-semibold">cmr-phi.vercel.app</span>
              </div>
            </div>
          </div>

          {/* Credentials Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-5">
              <Key className="h-5 w-5 text-indigo-600" />
              Credenciales de Integración
            </h2>

            <div className="space-y-4">
              {/* Webhook URL */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Globe className="h-3 w-3" /> URL del Webhook (Configurar en Meta Developers)
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <code className="flex-1 text-xs text-indigo-700 font-mono font-semibold truncate">
                    {WEBHOOK_URL}
                  </code>
                  <CopyButton text={WEBHOOK_URL} id="webhook" />
                  <a
                    href="https://developers.facebook.com/apps"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
                    title="Abrir Meta Developers"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Verify Token */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Token de Verificación
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <code className="flex-1 text-xs text-green-700 font-mono font-semibold">
                    {VERIFY_TOKEN}
                  </code>
                  <CopyButton text={VERIFY_TOKEN} id="verify" />
                </div>
              </div>

              {/* Phone Number ID */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone Number ID (Nicaragua)
                </label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <code className="flex-1 text-xs text-slate-700 font-mono font-semibold">
                    {PHONE_NUMBER_ID}
                  </code>
                  <CopyButton text={PHONE_NUMBER_ID} id="phone" />
                </div>
              </div>
            </div>

            {/* Checklist de pasos */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Pasos pendientes en Meta Developers
              </p>
              <ul className="space-y-1.5">
                {[
                  'Ir a developers.facebook.com → Tu App → WhatsApp → Configuration',
                  `Callback URL: ${WEBHOOK_URL}`,
                  `Verify Token: ${VERIFY_TOKEN}`,
                  'Habilitar campo: messages en Webhook Fields',
                  'Suscribir el número de teléfono al webhook',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-amber-800 font-semibold">
                    <span className="shrink-0 h-4 w-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ─── Consola de Logs en Tiempo Real ──────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col shadow-sm overflow-hidden">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4 shrink-0">
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            Logs en Tiempo Real
          </h2>

          {loadingLogs ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : recentLogs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <MessageCircle className="h-8 w-8 text-slate-200 mb-3" />
              <p className="text-xs text-slate-400 font-semibold">Sin actividad aún.</p>
              <p className="text-[10px] text-slate-300 font-semibold mt-1">
                Los mensajes de WhatsApp aparecerán aquí cuando lleguen al webhook.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 font-mono text-[10px]">
              {recentLogs.map(log => (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border ${
                    log.type === 'webhook_received'
                      ? 'bg-indigo-50/60 border-indigo-100/50 text-indigo-800'
                      : log.type === 'webhook_failed'
                        ? 'bg-red-50/60 border-red-100/50 text-red-800'
                        : 'bg-slate-50 border-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {logBadge(log.type)}
                    <span className="text-[9px] text-slate-400 font-semibold">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="leading-relaxed font-semibold truncate" title={JSON.stringify(log.payload)}>
                    {log.type === 'webhook_received'
                      ? `Mensaje recibido de ${log.payload?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || 'contacto desconocido'}`
                      : log.type === 'webhook_failed'
                        ? `Error: ${log.payload?.error || 'Error desconocido'}`
                        : log.status}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
