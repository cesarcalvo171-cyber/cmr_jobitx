import React from 'react';
import { 
  MessageSquare, UserPlus, Zap, Bot, 
  CheckCircle2, Handshake, CheckCircle,
  PlayCircle, Clock, Archive, UserCheck, Flame
} from 'lucide-react';

export default function DashboardView({ chats = [], leads = [] }) {
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
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
    { 
      label: 'TOTAL LEADS EN PIPE', 
      value: totalLeads.toString(), 
      subtitle: `${leadsHot} leads calientes 🔥`, 
      icon: UserPlus, 
      color: 'text-teal-600', 
      bg: 'bg-teal-50' 
    },
    { 
      label: 'CONVERSACIONES EN EJECUCIÓN', 
      value: enEjecucion.toString(), 
      subtitle: `${pendientes} pendientes`, 
      icon: PlayCircle, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'AUTOMATIZACIÓN BOT', 
      value: `${botEfficiency}%`, 
      subtitle: `${botActiveCount} chats atendidos por IA`, 
      icon: Bot, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50' 
    },
  ];

  // Actividad Reciente
  const recentActivity = chats.slice(0, 6).map(chat => ({
    contact: chat.name,
    phone: chat.phone || 'N/A',
    message: chat.lastMessage,
    agent: chat.status === 'IA' ? 'Bot IA' : 'Agente Humano',
    convStatus: chat.convStatus || 'En Ejecución',
    time: chat.timestamp,
    isBot: chat.status === 'IA'
  }));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 flex flex-col h-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">Panel de Control CRM</h1>
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

      {/* Grid de 2 Columnas: Estado de Conversaciones + Estado de Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Card 1: Estado de las Conversaciones */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800">Estado de Conversaciones</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Distribución de chats en el CRM</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                {totalChats} chats
              </span>
            </div>

            <div className="space-y-4">
              {/* En Ejecución */}
              <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                    <PlayCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">En Ejecución / Activos</p>
                    <p className="text-xs text-emerald-600 font-semibold">Chats en flujo de conversación activo</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-700">{enEjecucion}</span>
              </div>

              {/* Pendientes */}
              <div className="rounded-2xl p-4 bg-amber-50/60 border border-amber-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-amber-800">Pendientes</p>
                    <p className="text-xs text-amber-600 font-semibold">Esperando respuesta del asesor o cliente</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-amber-700">{pendientes}</span>
              </div>

              {/* Cerrados */}
              <div className="rounded-2xl p-4 bg-slate-100/70 border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-600 text-white">
                    <Archive className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Cerrados / Archivados</p>
                    <p className="text-xs text-slate-500 font-semibold">Conversaciones finalizadas</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-slate-700">{cerrados}</span>
              </div>
            </div>
          </div>

          {/* Distribución del Bot */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-indigo-700">
              <Bot className="h-4 w-4" />
              <span>Modo IA: {botActiveCount}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-700">
              <UserCheck className="h-4 w-4" />
              <span>Modo Humano: {humanActiveCount}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Estado de Leads en Embudo */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800">Estado de Leads</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Etapas de conversión en pipeline</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-100">
                {totalLeads} leads
              </span>
            </div>

            <div className="space-y-4">
              {/* Nuevos */}
              <div className="rounded-2xl p-4 bg-teal-50/60 border border-teal-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500 text-white">
                    <Handshake className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-teal-800">Nuevos Ingresos</p>
                    <p className="text-xs text-teal-600 font-semibold">Clientes recién registrados</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-teal-700">{leadsNuevos}</span>
              </div>

              {/* Calificados / Demo */}
              <div className="rounded-2xl p-4 bg-blue-50/60 border border-blue-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-blue-800">En Negociación / Demo</p>
                    <p className="text-xs text-blue-600 font-semibold">Leads calificados activos</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-blue-700">{leadsCalificados}</span>
              </div>

              {/* Cerrados - Ganados */}
              <div className="rounded-2xl p-4 bg-emerald-50/60 border border-emerald-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-800">Cerrados Exitosos</p>
                    <p className="text-xs text-emerald-600 font-semibold">Ventas finalizadas</p>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-700">{leadsCerrados}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1"><Flame className="h-4 w-4 text-red-500" /> Leads Calientes: {leadsHot}</span>
            <span>Total pipeline conversional</span>
          </div>
        </div>

      </div>

      {/* Tabla de Actividad Reciente */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex-1 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-800">Actividad Reciente en WhatsApp</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Últimas conversaciones recibidas en el CRM</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 border-b border-slate-100">
                <th className="pb-4">CONTACTO</th>
                <th className="pb-4">ÚLTIMO MENSAJE</th>
                <th className="pb-4 text-center">MODO ATENCIÓN</th>
                <th className="pb-4 text-center">ESTADO CHAT</th>
                <th className="pb-4 text-right">HORA</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((act, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                        {act.contact.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{act.contact}</p>
                        <p className="text-xs text-slate-400 font-semibold">{act.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-600 font-medium italic max-w-[260px] truncate">"{act.message}"</td>
                  <td className="py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                      act.isBot ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {act.isBot ? <Bot className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                      {act.agent}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                      act.convStatus === 'En Ejecución' || act.convStatus === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : act.convStatus === 'Pendiente' || act.convStatus === 'snoozed'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {act.convStatus}
                    </span>
                  </td>
                  <td className="py-4 text-right text-xs text-slate-400 font-semibold">{act.time}</td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr><td colSpan="5" className="text-center py-10 text-slate-400 font-medium">Sin actividad reciente de WhatsApp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
