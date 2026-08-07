import React, { useState } from 'react';
import { 
  MessageSquare, UserPlus, Zap, Bot, 
  CheckCircle2, Handshake, CheckCircle,
  PlayCircle, Clock, Archive, UserCheck, Flame
} from 'lucide-react';
import { useCRMStore } from '../store/crmStore';

export default function DashboardView({ chats = [], leads = [] }) {
  const [dashboardTab, setDashboardTab] = useState('conversaciones');
  const setActiveTab = useCRMStore(state => state.setActiveTab);
  const setActiveChatId = useCRMStore(state => state.setActiveChatId);

  const handleReply = (chatId) => {
    setActiveChatId(chatId);
    setActiveTab('chats');
  };

  // ── 1. Cálculos de métricas de Conversaciones ──
  const totalChats = chats.length;
  const enEjecucion = chats.filter(c => c.convStatus === 'En Ejecución' || c.convStatus === 'active' || !c.convStatus).length;
  const pendientes = chats.filter(c => c.convStatus === 'Pendiente' || c.convStatus === 'snoozed').length;
  const cerrados = chats.filter(c => c.convStatus === 'Cerrado' || c.convStatus === 'archived').length;

  const botActiveCount = chats.filter(c => c.status === 'IA' || c.botEnabled).length;
  const humanActiveCount = totalChats - botActiveCount;
  const botEfficiency = totalChats > 0 ? Math.round((botActiveCount / totalChats) * 100) : 0;

  // ── 2. Cálculos de métricas de Leads ──
  const totalLeads = leads.length;
  const leadsNuevos = leads.filter(l => l.stage === 'Nuevo').length;
  const leadsCalificados = leads.filter(l => l.stage === 'Demo Programada' || l.stage === 'Contactado' || l.stage === 'Propuesta').length;
  const leadsCerrados = leads.filter(l => l.stage === 'Cerrado').length;
  const leadsHot = leads.filter(l => l.score === 'hot').length;

  // Tarjetas Superiores
  const stats = [
    { 
      label: 'TOTAL CONVERSACIONES', 
      value: totalChats.toString(), 
      subtitle: `${enEjecucion} activas hoy`, 
      icon: MessageSquare, 
      color: 'text-blue-700', 
      bg: 'bg-blue-200' 
    },
    { 
      label: 'TOTAL LEADS EN PIPE', 
      value: totalLeads.toString(), 
      subtitle: `${leadsHot} leads calientes `, 
      icon: UserPlus, 
     color: 'text-blue-700', 
      bg: 'bg-blue-200' 
    },
    { 
      label: 'CONVERSACIONES EN EJECUCIÓN', 
      value: enEjecucion.toString(), 
      subtitle: `${pendientes} pendientes`, 
      icon: PlayCircle, 
      color: 'text-blue-700',  
      bg: 'bg-blue-200' 
    },
    { 
      label: 'AUTOMATIZACIÓN BOT', 
      value: `${botEfficiency}%`, 
      subtitle: `${botActiveCount} chats atendidos por IA`, 
      icon: Bot, 
      color: 'text-blue-700', 
      bg: 'bg-indigo-200' 
    },
  ];

  // Actividad Reciente simplificada (Últimos 5 para llenar el espacio)
  const recentActivity = chats.slice(0, 5).map(chat => ({
    id: chat.id,
    contact: chat.name,
    message: chat.lastMessage,
    time: chat.timestamp,
  }));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 flex flex-col h-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
        <div>
          <h1 className="text-3xl font-black text-shadow-black tracking-tight font-outfit">Panel de Control</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Resumen general de rendimiento, conversaciones y embudo de ventas.</p>
        </div>
      </div>

      {/* Tarjetas Principales de Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1">{stat.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Inferior: Tabs de Estado a la izq, Actividad a la der */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-[400px]">
        
        {/* Lado Izquierdo: Pestañas de Estado */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
          {/* Navegación de Pestañas */}
          <div className="flex gap-4 border-b border-slate-100 mb-6">
            <button 
              onClick={() => setDashboardTab('conversaciones')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
                dashboardTab === 'conversaciones' 
                  ? 'border-blue-600 text-blue-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Conversaciones
            </button>
            <button 
              onClick={() => setDashboardTab('leads')}
              className={`pb-3 text-sm font-bold transition-colors border-b-2 ${
                dashboardTab === 'leads' 
                  ? 'border-blue-600 text-blue-700' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              Pipeline de Leads
            </button>
          </div>

          {/* Contenido de Pestañas */}
          <div className="flex-1 overflow-y-auto pr-2">
            {dashboardTab === 'conversaciones' ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500 font-medium">Distribución de {totalChats} chats en el CRM</p>
                </div>
                {/* En Ejecución */}
                <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-black">En Ejecución / Activos</p>
                      <p className="text-xs text-black font-semibold">Chats en flujo activo</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-black">{enEjecucion}</span>
                </div>
                {/* Pendientes */}
                <div className="rounded-2xl p-4 bg-amber-50/60 border border-amber-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-black">Pendientes</p>
                      <p className="text-xs text-black font-semibold">Esperando respuesta</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-black">{pendientes}</span>
                </div>
                {/* Cerrados */}
                <div className="rounded-2xl p-4 bg-slate-100/70 border border-slate-200 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-600 text-white">
                      <Archive className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Archivados</p>
                      <p className="text-xs text-slate-500 font-semibold">Conversaciones finalizadas</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-slate-700">{cerrados}</span>
                </div>
                {
                  /*
                   <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Bot className="h-4 w-4" /><span>Modo IA: {botActiveCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <UserCheck className="h-4 w-4" /><span>Humano: {humanActiveCount}</span>
                  </div>
                </div>
                  
                  */
                }
               
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-xs text-slate-500 font-medium">Embudo de {totalLeads} prospectos activos</p>
                </div>
                {/* Nuevos */}
                <div className="rounded-2xl p-4 bg-teal-50/60 border border-teal-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-500 text-white">
                      <Handshake className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-black">Nuevos Ingresos</p>
                      <p className="text-xs text-black font-semibold">Recién registrados</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-black">{leadsNuevos}</span>
                </div>
                {/* Calificados */}
                <div className="rounded-2xl p-4 bg-blue-50/60 border border-blue-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-black">En Negociación</p>
                      <p className="text-xs text-black font-semibold">Leads calificados</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-black">{leadsCalificados}</span>
                </div>
                {/* Cerrados */}
                <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold uppercase tracking-wider text-black">Cerrados Exitosos</p>
                      <p className="text-xs text-black font-semibold">Ventas finalizadas</p>
                    </div>
                  </div>
                  <span className="text-2xl font-black text-black">{leadsCerrados}</span>
                </div>
                {/* Calientes 
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-red-500" /> Leads Calientes: {leadsHot}</span>
                </div>
                
                */}
                
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Actividad Reciente */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-800">Bandeja de Acción Rápida</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Últimos chats recibidos</p>
            </div>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            {recentActivity.map(act => (
              <div key={act.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors flex justify-between items-center gap-4 group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-800 text-sm truncate">{act.contact}</span>
                    <span className="text-[10px] font-bold text-slate-400">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate italic">"{act.message}"</p>
                </div>
                <button 
                  onClick={() => handleReply(act.id)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shrink-0 opacity-100 sm:opacity-50 sm:group-hover:opacity-100"
                >
                  Responder
                </button>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-10 text-slate-400 font-medium text-xs">
                Bandeja vacía. No hay chats recientes.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
