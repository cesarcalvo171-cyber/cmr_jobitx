import React, { useState, useEffect } from 'react';
import { Save, Bot, Sparkles, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PROMPT_PREDETERMINADO = `Eres el Asistente Virtual Inteligente de TalosFlow Préstamos. 
Tu objetivo es atender a los clientes por WhatsApp que consultan sobre préstamos personales o de negocio.

Tono de comunicación:
- Profesional, amable, claro y directo.
- Responde siempre de forma breve y concisa (máximo 3-4 líneas por mensaje).

Reglas de atención:
1. Saluda cordialmente y pregunta el monto del préstamo que el cliente necesita y para qué objetivo.
2. Explica que los préstamos van desde $500 hasta $10,000 USD con plazos flexibles.
3. Si el cliente confirma un monto, solicita su nombre completo y número de cédula/identificación para enviarlo con un asesor.
4. Nunca prometas aprobaciones inmediatas sin revisión del equipo de crédito.
5. Si el cliente pide hablar con una persona, despídete amablemente e indica que un asesor tomará el control.`;

export default function PromptConfig() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Cargar el prompt real almacenado en Supabase al montar el componente
  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'ai_agent_settings')
        .maybeSingle();

      if (error) throw error;

      if (data && data.value && data.value.system_prompt) {
        setPrompt(data.value.system_prompt);
      } else {
        setPrompt(PROMPT_PREDETERMINADO);
      }
    } catch (err) {
      console.error('Error al cargar prompt desde Supabase:', err);
      setPrompt(PROMPT_PREDETERMINADO);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(false);
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'ai_agent_settings',
          value: { 
            system_prompt: prompt,
            updated_at: new Date().toISOString()
          }
        }, { onConflict: 'key' });

      if (error) throw error;

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error('Error al guardar el prompt:', err);
      alert('Error guardando el prompt en Supabase: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefault = () => {
    if (window.confirm('¿Deseas restaurar la plantilla predeterminada de Asistente de Préstamos?')) {
      setPrompt(PROMPT_PREDETERMINADO);
    }
  };

  return (
    <div className="flex-1 bg-slate-50/50 p-4 md:p-8 h-full overflow-y-auto">
      
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">
          Configuración del Agente IA
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Modifica las instrucciones y comportamiento que utilizará el nodo de n8n y Gemini en WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        
        {/* Editor de Prompt (2 Columnas) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-600" />
                SYSTEM PROMPT DEL AGENTE (INSTRUCCIONES DE N8N)
              </label>

              <button
                onClick={handleRestoreDefault}
                className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1 transition-colors"
                title="Restaurar plantilla recomendada"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Plantilla
              </button>
            </div>

            {loading ? (
              <div className="h-80 flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 font-semibold text-xs">
                Cargando configuración desde Supabase...
              </div>
            ) : (
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-80 p-5 bg-slate-50/60 border border-slate-200 rounded-2xl text-xs text-slate-800 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all mb-4"
                placeholder="Escribe aquí las instrucciones para la IA..."
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">
              {prompt.length} caracteres
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {successMsg && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4" /> ¡Guardado en Supabase! n8n ya usa estas instrucciones.
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Guardando en BD...' : 'Guardar Instrucciones'}
              </button>
            </div>
          </div>
        </div>

        {/* Panel Explicativo de Conexión con n8n (1 Columna) */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-indigo-700 mb-3">
              <Sparkles className="h-5 w-5" />
              <h3 className="font-extrabold text-sm text-slate-800">¿Cómo se conecta con n8n?</h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
              Cada vez que un cliente envía un mensaje por WhatsApp, el flujo de **n8n** consulta automáticamente la tabla <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">settings</code> en Supabase con la clave <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-bold">ai_agent_settings</code>.
            </p>

            <div className="space-y-3 text-[11px] font-semibold text-slate-500">
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                <span>Editas las instrucciones aquí en el CRM y presionas **Guardar**.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                <span>Se actualiza en la base de datos de Supabase.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-5 w-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                <span>En la siguiente conversación de WhatsApp, el Agente IA de n8n adopta las nuevas reglas de inmediato sin reiniciar nada.</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 rounded-3xl border border-emerald-100 p-6">
            <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider mb-2">Recomendaciones para el Prompt</h4>
            <ul className="text-xs text-emerald-700 space-y-2 font-medium list-disc pl-4">
              <li>Define claramente qué montos de crédito ofrece la empresa.</li>
              <li>Indica qué datos debe solicitar al cliente (nombre, monto, cédula).</li>
              <li>Mantén las instrucciones cortas para que el bot responda rápido.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
