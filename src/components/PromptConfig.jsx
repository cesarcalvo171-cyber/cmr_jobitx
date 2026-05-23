import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PromptConfig() {
  const [prompt, setPrompt] = useState('Sos Berta, la asistente virtual de GF Marketing...');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save to DB as requested by previous setups or do the actual DB call
    await supabase
      .from('settings')
      .upsert({
        key: 'ai_agent_settings',
        value: { system_prompt: prompt },
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });
    
    setTimeout(() => {
      setSaving(false);
      alert('Prompt guardado exitosamente');
    }, 500);
  };

  return (
    <div className="flex-1 bg-slate-50/50 p-8 h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight font-outfit">Configuración del Prompt</h1>
        <p className="text-base text-slate-500 font-medium mt-1">Editá el system prompt que usa la IA</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm max-w-5xl">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-4">
          SYSTEM PROMPT
        </label>
        
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-80 p-6 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all mb-4"
          placeholder="Escribe el prompt aquí..."
        />
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400">
            {prompt.length} caracteres
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#059669] hover:bg-[#047857] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-green-600/20 disabled:opacity-70"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
