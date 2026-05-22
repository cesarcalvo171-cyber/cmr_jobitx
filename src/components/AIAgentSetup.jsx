import React, { useState } from 'react';
import { Bot, Sparkles, Sliders, Database, Save, Eye, RefreshCw, FileText, CheckCircle } from 'lucide-react';

export default function AIAgentSetup() {
  const [isActive, setIsActive] = useState(true);
  const [model, setModel] = useState('Gemini 3.5 Flash (High)');
  const [systemPrompt, setSystemPrompt] = useState(
    "Eres TalosBot, un asistente de ventas de alta calidad para TalosFlow. Tu objetivo es saludar a los leads cordialmente, responder preguntas sobre la plataforma (planes de precios, capacidades, webhooks, WhatsApp) y persuadirlos para que agenden una demostración gratuita con Erik Taveras.\n\nReglas:\n1. Sé amable y mantén un tono profesional.\n2. Si el cliente pregunta por costos, dile que los planes inician en $49 USD/mes.\n3. Una vez que detectes interés real, ofrece agendar una demo compartiendo el link de Calendly."
  );
  const [temperature, setTemperature] = useState(0.4);
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Dossier_Precios_TalosFlow_2026.pdf', size: '2.4 MB', status: 'Indexado' },
    { id: 2, name: 'Preguntas_Frecuentes_Integracion_Webhooks.docx', size: '840 KB', status: 'Indexado' },
    { id: 3, name: 'Politica_de_Privacidad_y_Seguridad.txt', size: '120 KB', status: 'Indexado' }
  ]);
  const [docName, setDocName] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    alert("¡Configuración del Agente IA guardada correctamente!");
  };

  const handleAddDoc = (e) => {
    e.preventDefault();
    if (!docName.trim()) return;
    setDocuments(prev => [
      ...prev,
      {
        id: Date.now(),
        name: docName.trim(),
        size: `${(Math.random() * 2 + 0.1).toFixed(1)} MB`,
        status: 'Indexando...'
      }
    ]);
    setDocName('');

    // Simulate indexing completing
    setTimeout(() => {
      setDocuments(prev => 
        prev.map(d => d.name === docName.trim() ? { ...d, status: 'Indexado' } : d)
      );
    }, 2000);
  };

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden select-none p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Agente IA</h1>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">Define las directrices y entrena al cerebro automatizado de tu CRM.</p>
        </div>
        {/* Toggle Switch */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          <span className="text-xs font-bold text-slate-600">Estado del Agente</span>
          <button
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isActive ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Settings Core Form */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm overflow-y-auto">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600" />
            Configuración del Modelo
          </h2>

          <div className="space-y-6 flex-1">
            {/* Model & Temp Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Select Model */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Modelo LLM Activo</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white cursor-pointer"
                >
                  <option value="Gemini 3.5 Flash (High)">Gemini 3.5 Flash (High) - Recomendado</option>
                  <option value="Gemini 3.5 Pro">Gemini 3.5 Pro - Razonamiento Avanzado</option>
                  <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                  <option value="GPT-4o">GPT-4o Mini</option>
                </select>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Creatividad (Temperatura: {temperature})</label>
                  <span className="text-[10px] text-indigo-600 font-bold">Preciso</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Prompt Instructions */}
            <div className="flex-1 flex flex-col min-h-[180px]">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Instrucciones de comportamiento (System Prompt)</label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full flex-1 p-4 bg-slate-50 border border-slate-100 focus:border-indigo-100 focus:bg-white rounded-2xl text-xs font-medium leading-relaxed resize-none focus:outline-none"
                placeholder="Escribe el prompt aquí..."
              />
            </div>
          </div>

          {/* Action button */}
          <div className="border-t border-slate-50 pt-5 mt-6 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Ajustes</span>
            </button>
          </div>
        </form>

        {/* Right Panel: Knowledge Base */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col shadow-sm h-full overflow-hidden">
          <h2 className="text-base font-bold text-slate-800 tracking-tight mb-4 flex items-center gap-2 shrink-0">
            <Database className="h-5 w-5 text-indigo-600" />
            Base de Conocimiento
          </h2>
          <p className="text-xs text-slate-400 font-semibold mb-6 shrink-0">Carga documentación relevante para que el bot la consulte antes de responder.</p>

          {/* Add Doc Form */}
          <form onSubmit={handleAddDoc} className="flex gap-2 mb-6 shrink-0">
            <input
              type="text"
              placeholder="Enlace o nombre de archivo..."
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="flex-1 bg-slate-50 text-xs px-3 py-2 border border-transparent focus:border-slate-100 focus:outline-none rounded-xl font-semibold"
            />
            <button 
              type="submit"
              className="px-3.5 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 active:scale-95 transition-all"
            >
              Cargar
            </button>
          </form>

          {/* Docs list */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {documents.map(doc => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8.5 w-8.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <FileText className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-bold text-slate-700 truncate" title={doc.name}>
                      {doc.name}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-400 mt-0.5">{doc.size}</span>
                  </div>
                </div>

                <span className={`text-[9px] font-bold flex items-center gap-0.5 shrink-0 px-2 py-0.5 rounded-full ${
                  doc.status === 'Indexado' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {doc.status === 'Indexado' ? <CheckCircle className="h-2.5 w-2.5" /> : <RefreshCw className="h-2.5 w-2.5 animate-spin" />}
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
