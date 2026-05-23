import React, { useState } from 'react';
import { UserPlus, Search, Filter, Download, ArrowRight, ArrowLeft, MessageSquare } from 'lucide-react';

export default function FunnelBoard({ leads, onAddLead }) {
  const [search, setSearch] = useState('');
  
  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) || 
    lead.phone.includes(search)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Cerrado': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Demo Programada': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Gestión de Prospectos</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Administra y califica tus leads entrantes de WhatsApp y Web.</p>
        </div>
        <button 
          onClick={() => {
            const name = prompt("Nombre del Lead:");
            const phone = prompt("Número de WhatsApp (ej. +521...):");
            if (name && phone) {
              onAddLead({ name, phone, stage: 'Nuevo', value: '$0/mes' });
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold shadow-md shadow-green-600/20 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Lead
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">LEADS TOTALES</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-slate-800">{leads.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">DEMOS PROGRAMADAS</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-slate-800">{leads.filter(l => l.stage === 'Demo Programada').length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">CERRADOS GANADOS</p>
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-bold text-slate-800">{leads.filter(l => l.stage === 'Cerrado').length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">VALOR ESTIMADO</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-bold text-indigo-600">{leads.filter(l => l.stage === 'Cerrado').length * 49} USD/mes</h3>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[400px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filtrar por nombre o teléfono..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100 bg-slate-50/50">
                <th className="py-4 px-6">NOMBRE</th>
                <th className="py-4 px-6">WHATSAPP</th>
                <th className="py-4 px-6">ORIGEN</th>
                <th className="py-4 px-6">ESTADO</th>
                <th className="py-4 px-6">VALOR</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${lead.avatarColor || 'bg-slate-100 text-slate-600'}`}>
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{lead.name}</p>
                        <p className="text-xs text-slate-500 font-medium">Pipeline: {lead.company}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <MessageSquare className="h-3.5 w-3.5 text-green-500" />
                      {lead.phone || 'N/A'}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold">
                      WhatsApp Inbound
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold w-max border ${getStatusColor(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-700 text-sm">{lead.value}</p>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-medium">
                    No se encontraron leads.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
