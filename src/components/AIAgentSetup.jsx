import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Sliders, Database, Save, RefreshCw, FileText, CheckCircle, CheckCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const DEFAULT_PROMPT = `Eres TalosBot, un asistente de ventas de alta calidad para TalosFlow CRM. Tu objetivo es saludar a los leads cordialmente, responder preguntas sobre la plataforma (planes de precios, capacidades, webhooks, WhatsApp) y persuadirlos para que agenden una demostración gratuita con Erik Taveras.

Reglas:
1. Sé amable y mantén un tono profesional pero cercano.
2. Si el cliente pregunta por costos, dile que los planes inician en $49 USD/mes (Plan Pro).
3. Una vez que detectes interés real, ofrece agendar una demo compartiendo el link de Calendly.
4. Responde siempre en español, de forma concisa y natural.`;

const MODELS = [
  { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 — Recomendado (OpenRouter)' },
  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (OpenRouter)' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku (OpenRouter)' },
  { value: 'google/gemini-flash-1.5', label: 'Gemini Flash 1.5 (OpenRouter)' },
];

export default function AIAgentSetup() {
  const [isActive, setIsActive] = useState(true);
  const [model, setModel] = useState('deepseek/deepseek-chat');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [temperature, setTemperature] = useState(0.4);
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Dossier_Precios_TalosFlow_2026.pdf', size: '2.4 MB', status: 'Indexado' },
    { id: 2, name: 'Preguntas_Frecuentes_Webhooks.docx', size: '840 KB', status: 'Indexado' },
  ]);
  const [docName, setDocName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(true);

  // ─── Cargar configuración desde Supabase ─────────────────────────────────────
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'ai_agent_settings')
        .maybeSingle();

      if (!error && data?.value) {
        const cfg = data.value;
        if (cfg.model) setModel(cfg.model);
        if (cfg.system_prompt) setSystemPrompt(cfg.system_prompt);
        if (cfg.temperature !== undefined) setTemperature(cfg.temperature);
        if (cfg.active !== undefined) setIsActive(cfg.active);
      }
      setLoading(false);
    };

    loadSettings();
  }, []);

  // ─── Guardar configuración en Supabase ───────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus(null);

    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'ai_agent_settings',
        value: {
          model,
          temperature,
          system_prompt: systemPrompt,
          active: isActive,
          max_tokens: 500,
        },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    setSaving(false);
    if (error) {
      console.error('Error guardando configuración IA:', error);
      setSaveStatus('error');
    } else {
      setSaveStatus('success');
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAddDoc = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    const newDoc = { id: Date.now(), name: docName.trim(), size: `${(Math.random() * 2 + 0.1).toFixed(1)} MB`, status: 'Indexando...' };
    setDocuments(prev => [...prev, newDoc]);
    setDocName('');
    setTimeout(() => {
      setDocuments(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: 'Indexado' } : d));
    }, 2000);
  };

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden select-none p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Agente IA</h1>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">
            Define las directrices del cerebro automatizado — Configuración guardada en Supabase.
          </p>
        </div>

        {/* Toggle activo/inactivo */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          <span className="text-xs font-bold text-slate-600">Estado del Agente</span>
          <button
            onClick={() => setIsActive(!isActive)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-40 ${
              isActive ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
            {isActive ? 'ACTIVO' : 'INACTIVO'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0">

        {/* ─── Formulario de Configuración ──────────────────────────────────────── */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm overflow-y-auto">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600" />
            Configuración del Modelo
            {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-300 ml-auto" />}
          </h2>

          <div className="space-y-6 flex-1">
            {/* Modelo + Temperatura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Modelo LLM (via OpenRouter)
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white cursor-pointer disabled:opacity-50"
                >
                  {MODELS.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Creatividad (Temperatura: {temperature})
                  </label>
                  <span className="text-[10px] text-indigo-600 font-bold">
                    {temperature <= 0.3 ? 'Preciso' : temperature <= 0.6 ? 'Equilibrado' : 'Creativo'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  disabled={loading}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
                />
                <div className="flex justify-between text-[9px] text-slate-300 font-semibold mt-1">
                  <span>0 — Exacto</span>
                  <span>1 — Libre</span>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div className="flex flex-col flex-1 min-h-[200px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Instrucciones de Comportamiento (System Prompt)
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                disabled={loading}
                className="w-full flex-1 p-4 bg-slate-50 border border-slate-100 focus:border-indigo-200 focus:bg-white rounded-2xl text-xs font-medium leading-relaxed resize-none focus:outline-none transition-colors disabled:opacity-50 min-h-[200px]"
                placeholder="Escribe las instrucciones del agente aquí..."
              />
              <p className="text-[10px] text-slate-300 font-semibold mt-1.5 text-right">
                {systemPrompt.length} caracteres
              </p>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="border-t border-slate-50 pt-5 mt-4 flex items-center justify-between">
            {/* Feedback de guardado */}
            {saveStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                <CheckCheck className="h-4 w-4" />
                ¡Guardado en Supabase exitosamente!
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                <AlertCircle className="h-4 w-4" />
                Error al guardar. Verifica la conexión.
              </span>
            )}
            {!saveStatus && <span />}

            <button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
            >
              {saving
                ? <><RefreshCw className="h-4 w-4 animate-spin" /><span>Guardando...</span></>
                : <><Save className="h-4 w-4" /><span>Guardar en Supabase</span></>
              }
            </button>
          </div>
        </form>

        {/* ─── Base de Conocimiento ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm h-full overflow-hidden">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-1 flex items-center gap-2 shrink-0">
            <Database className="h-5 w-5 text-indigo-600" />
            Base de Conocimiento
          </h2>
          <p className="text-xs text-slate-400 font-semibold mb-5 shrink-0">
            Carga documentación para que el bot la consulte antes de responder.
          </p>

          {/* Agregar documento */}
          <form onSubmit={handleAddDoc} className="flex gap-2 mb-5 shrink-0">
            <input
              type="text"
              placeholder="Nombre o enlace del archivo..."
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="flex-1 bg-slate-50 text-xs px-3 py-2 border border-transparent focus:border-slate-100 focus:outline-none rounded-xl font-semibold"
            />
            <button
              type="submit"
              className="px-3.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
            >
              Añadir
            </button>
          </form>

          {/* Lista de documentos */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 truncate" title={doc.name}>
                      {doc.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">{doc.size}</span>
                  </div>
                </div>

                <span className={`text-[9px] font-bold flex items-center gap-0.5 shrink-0 px-2 py-0.5 rounded-full ml-2 ${
                  doc.status === 'Indexado'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {doc.status === 'Indexado'
                    ? <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                    : <RefreshCw className="h-2.5 w-2.5 mr-0.5 animate-spin" />
                  }
                  {doc.status}
                </span>
              </div>
            ))}
          </div>

          {/* Nota de OpenRouter */}
          <div className="mt-4 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl shrink-0">
            <div className="flex items-start gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-indigo-700 font-semibold leading-relaxed">
                El agente usa <strong>OpenRouter API</strong> con DeepSeek V3.
                Configura <code className="bg-indigo-100 px-1 rounded">OPENROUTER_API_KEY</code> en las variables de entorno de Vercel para activarlo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
