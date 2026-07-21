import React, { useState } from 'react';
import { UserPlus, Search, MessageSquare, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight, X, Download } from 'lucide-react';
import { exportToCsv } from '../lib/exportCsv';
import { useCRMStore } from '../store/crmStore';

const ETAPAS = ['Nuevo', 'En Proceso', 'Prestamo Programado', 'Prestamo Cerrado'];

const ETAPA_CONFIG = {
  'Nuevo': {
    label: 'Nuevo Interesado',
    desc: 'Contacto mostro interes por un prestamo',
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    bar: 'bg-slate-400'
  },
  'En Proceso': {
    label: 'En Proceso',
    desc: 'Evaluando documentos y condiciones',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-400',
    bar: 'bg-amber-400'
  },
  'Prestamo Programado': {
    label: 'Prestamo Programado',
    desc: 'Monto acordado, pendiente de desembolso',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500'
  },
  'Prestamo Cerrado': {
    label: 'Prestamo Cerrado',
    desc: 'Dinero entregado, prestamo activo',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500'
  }
};

export default function FunnelBoard({ leads = [], onAddLead }) {
  const { moveLead } = useCRMStore();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterEtapa, setFilterEtapa] = useState('todas');

  // Estado del formulario
  const [form, setForm] = useState({
    name: '',
    phone: '',
    stage: 'Nuevo',
    monto: '',
    reason: ''
  });

  const handleExportExcel = () => {
    const headers = ['Nombre Cliente', 'WhatsApp', 'Etapa Prestamo', 'Monto Solicitado (USD)', 'Prioridad Score', 'Motivo / Nota'];
    const rows = leads.map(lead => [
      lead.name || 'Sin Nombre',
      lead.phone || '',
      lead.stage || 'Nuevo',
      lead.monto || 0,
      lead.score === 'hot' ? 'Alta' : lead.score === 'warm' ? 'Media' : 'Normal',
      lead.reason || ''
    ]);
    exportToCsv('Pipeline_Prestamos', headers, rows);
  };

  // ── Calculos reales de prestamos ──
  const totalLeads = leads.length;
  const prestamosEnProceso = leads.filter(l => l.stage === 'En Proceso').length;
  const prestamosProgramados = leads.filter(l => l.stage === 'Prestamo Programado').length;
  const prestamosCerrados = leads.filter(l => l.stage === 'Prestamo Cerrado').length;

  // Sumar montos reales desde Supabase (solo cerrados = dinero ya colocado)
  const montoTotalColocado = leads
    .filter(l => l.stage === 'Prestamo Cerrado')
    .reduce((sum, l) => sum + (parseFloat(l.monto) || 0), 0);

  // Monto total del pipeline (todo lo que esta en proceso o programado)
  const montoPipeline = leads
    .filter(l => l.stage !== 'Nuevo')
    .reduce((sum, l) => sum + (parseFloat(l.monto) || 0), 0);

  // ── Filtrado ──
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
                          (lead.phone && lead.phone.includes(search));
    const matchesEtapa = filterEtapa === 'todas' || lead.stage === filterEtapa;
    return matchesSearch && matchesEtapa;
  });

  // ── Crear Lead ──
  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    onAddLead({ ...form, monto: parseFloat(form.monto) || 0 });
    setForm({ name: '', phone: '', stage: 'Nuevo', monto: '', reason: '' });
    setIsFormOpen(false);
  };

  // ── Formato de moneda ──
  const formatMonto = (val) => {
    if (!val || val === 0) return '—';
    return new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 flex flex-col h-full">

      {/* ── Encabezado ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">Gestion de Prestamos</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Pipeline completo de solicitudes de prestamos via WhatsApp.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-sm font-bold transition-all border border-slate-200 shrink-0"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {/* ── Tarjetas de metricas reales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 w-fit mb-3">
            <MessageSquare className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">LEADS TOTALES</p>
          <h3 className="text-3xl font-black text-slate-800">{totalLeads}</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">{leads.filter(l => l.stage === 'Nuevo').length} nuevos sin procesar</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 w-fit mb-3">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">PRESTAMOS PROG.</p>
          <h3 className="text-3xl font-black text-slate-800">{prestamosProgramados}</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">{prestamosEnProceso} en evaluacion</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 w-fit mb-3">
            <CheckCircle className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">PRESTAMOS CERRADOS</p>
          <h3 className="text-3xl font-black text-slate-800">{prestamosCerrados}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Dinero ya desembolsado</p>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-indigo-100 flex flex-col">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 w-fit mb-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest mb-1">CAPITAL COLOCADO</p>
          <h3 className="text-2xl font-black text-indigo-700">{formatMonto(montoTotalColocado)}</h3>
          <p className="text-xs text-indigo-400 font-semibold mt-1">Pipeline: {formatMonto(montoPipeline)}</p>
        </div>

      </div>

      {/* ── Barra de Filtros y Busqueda ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
        
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          
          {/* Buscador */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 bg-slate-50"
            />
          </div>

          {/* Filtros de etapa */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterEtapa('todas')}
              className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${filterEtapa === 'todas' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Todos ({totalLeads})
            </button>
            {ETAPAS.map(etapa => (
              <button
                key={etapa}
                onClick={() => setFilterEtapa(etapa)}
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border ${
                  filterEtapa === etapa
                    ? ETAPA_CONFIG[etapa].color + ' font-extrabold shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {ETAPA_CONFIG[etapa].label} ({leads.filter(l => l.stage === etapa).length})
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabla de Leads ── */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400">
                <th className="py-4 px-6">PROSPECTO</th>
                <th className="py-4 px-6">WHATSAPP</th>
                <th className="py-4 px-6 text-center">ETAPA</th>
                <th className="py-4 px-6 text-center">MONTO PRESTAMO</th>
                <th className="py-4 px-6">MOTIVO / NOTA</th>
                <th className="py-4 px-6 text-center">AVANZAR ETAPA</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const cfg = ETAPA_CONFIG[lead.stage] || ETAPA_CONFIG['Nuevo'];
                const currentIndex = ETAPAS.indexOf(lead.stage);
                const nextStage = currentIndex < ETAPAS.length - 1 ? ETAPAS[currentIndex + 1] : null;

                return (
                  <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                    
                    {/* Nombre */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${lead.avatarColor || 'bg-slate-100 text-slate-600'}`}>
                          {lead.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{lead.name}</p>
                          <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}></span>
                            <span className="text-slate-500">{cfg.label}</span>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Telefono */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        {lead.phone || 'Sin telefono'}
                      </div>
                    </td>

                    {/* Selector de Etapa */}
                    <td className="py-4 px-6 text-center">
                      <select
                        value={lead.stage}
                        onChange={(e) => moveLead(lead.id, e.target.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${cfg.color}`}
                      >
                        {ETAPAS.map(etapa => (
                          <option key={etapa} value={etapa} className="bg-white text-slate-800 font-semibold text-xs">
                            {ETAPA_CONFIG[etapa].label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Monto del Prestamo */}
                    <td className="py-4 px-6 text-center">
                      {lead.monto && lead.monto > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="font-black text-slate-800 text-base">{formatMonto(lead.monto)}</span>
                          <span className="text-[9px] font-bold text-slate-400">monto solicitado</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 italic">Sin monto definido</span>
                      )}
                    </td>

                    {/* Motivo */}
                    <td className="py-4 px-6 max-w-[200px]">
                      <p className="text-xs text-slate-500 font-medium truncate">{lead.reason || '—'}</p>
                    </td>

                    {/* Boton de Avanzar Etapa */}
                    <td className="py-4 px-6 text-center">
                      {nextStage ? (
                        <button
                          onClick={() => moveLead(lead.id, nextStage)}
                          className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border shadow-xs hover:scale-105 active:scale-95 ${ETAPA_CONFIG[nextStage].color}`}
                          title={`Avanzar a: ${ETAPA_CONFIG[nextStage].label}`}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                          {ETAPA_CONFIG[nextStage].label}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          ✓ Desembolsado
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-16 text-center text-slate-400 font-medium text-xs">
                    No se encontraron prospectos de prestamos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal Formulario Nuevo Prospecto ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-100">
            
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black text-slate-800">Nuevo Prospecto de Prestamo</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Registra manualmente o convierte desde un chat</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Nombre del Cliente</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="ej. Juan Perez"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Numero de WhatsApp</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="ej. +50558517405"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Etapa</label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  >
                    {ETAPAS.map(e => (
                      <option key={e} value={e}>{e}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Monto Solicitado (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={form.monto}
                      onChange={(e) => setForm({ ...form, monto: e.target.value })}
                      placeholder="ej. 2000"
                      min="0"
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Motivo / Nota del Prestamo</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="ej. Cliente solicito prestamo para capital de trabajo, acordado en chat el 15-Jul"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
                >
                  Registrar Prestamo
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
