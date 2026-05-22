import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Kanban, Sparkles, DollarSign, Briefcase, Phone, User } from 'lucide-react';

export default function FunnelBoard({ leads, onMoveLead, onAddLead }) {
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  
  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('Nuevo');
  const [phone, setPhone] = useState('');

  const stages = ['Nuevo', 'Contactado', 'Demo Programada', 'Propuesta', 'Cerrado'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLead = {
      id: `lead-${Date.now()}`,
      name,
      company: company || 'Personal',
      value: value ? `$${value}/mes` : '$0/mes',
      stage,
      phone,
      avatarColor: 'bg-emerald-100 text-emerald-700'
    };

    onAddLead(newLead);
    setName('');
    setCompany('');
    setValue('');
    setStage('Nuevo');
    setPhone('');
    setShowAddLeadModal(false);
  };

  const getLeadsByStage = (stageName) => {
    return leads.filter(lead => lead.stage === stageName);
  };

  const getColumnTotal = (stageName) => {
    const stageLeads = getLeadsByStage(stageName);
    const sum = stageLeads.reduce((total, lead) => {
      const numericVal = parseInt(lead.value.replace(/[^0-9]/g, '')) || 0;
      return total + numericVal;
    }, 0);
    return sum.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) + '/mes';
  };

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden select-none p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Embudo de Ventas</h1>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">Monitorea el progreso de tus tratos y el valor total de tu pipeline comercial.</p>
        </div>
        <button
          onClick={() => setShowAddLeadModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
        >
          <Kanban className="h-4.5 w-4.5" />
          <span>Añadir Oportunidad</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start select-none">
        {stages.map((stageName) => {
          const stageLeads = getLeadsByStage(stageName);
          return (
            <div 
              key={stageName} 
              className="flex-1 min-w-[250px] max-w-[320px] bg-slate-100/50 border border-slate-200/40 rounded-3xl p-4 flex flex-col max-h-full"
            >
              {/* Stage Header */}
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 tracking-wide">{stageName}</span>
                  <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded-md shadow-sm">
                    {stageLeads.length}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 tracking-wide mt-0.5 block">{getColumnTotal(stageName)}</span>
              </div>

              {/* Leads Stream */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 py-1">
                {stageLeads.length > 0 ? (
                  stageLeads.map((lead) => (
                    <div 
                      key={lead.id} 
                      className="group bg-white border border-slate-100 hover:border-slate-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 select-none relative"
                    >
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className={`h-8 w-8 rounded-lg ${lead.avatarColor || 'bg-slate-100 text-slate-700'} font-bold text-xs flex items-center justify-center`}>
                          {lead.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">{lead.name}</span>
                          <span className="text-[9px] font-semibold text-slate-400 -mt-0.5 truncate flex items-center gap-1">
                            <Briefcase className="h-2.5 w-2.5" />
                            {lead.company}
                          </span>
                        </div>
                      </div>

                      {/* Lead Value */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-2.5">
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                          <DollarSign className="h-3 w-3" />
                          {lead.value}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-0.5">
                          <Phone className="h-2.5 w-2.5" />
                          {lead.phone || 'Sin tel'}
                        </span>
                      </div>

                      {/* Hover action arrows */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 p-1 rounded-lg border border-slate-100 shadow-sm transition-opacity">
                        {stages.indexOf(stageName) > 0 && (
                          <button 
                            onClick={() => onMoveLead(lead.id, stages[stages.indexOf(stageName) - 1])}
                            className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded transition-colors"
                            title="Mover a la izquierda"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                        )}
                        {stages.indexOf(stageName) < stages.length - 1 && (
                          <button 
                            onClick={() => onMoveLead(lead.id, stages[stages.indexOf(stageName) + 1])}
                            className="p-1 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded transition-colors"
                            title="Mover a la derecha"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-300 font-semibold text-[10px]">
                    Arrastra oportunidades aquí
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100/60 overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Crear Nueva Oportunidad</h3>
              <button 
                onClick={() => setShowAddLeadModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 rounded-lg hover:bg-slate-50"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sofía Rodríguez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                />
              </div>

              {/* Company & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Empresa</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej. Gmail Personal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +54..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Value & Stage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Valor Mensual ($)</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Ej. 120"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fase del Funnel</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Demo Programada">Demo Programada</option>
                    <option value="Propuesta">Propuesta</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Añadir Oportunidad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
