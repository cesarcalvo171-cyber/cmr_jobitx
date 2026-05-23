import React from 'react';
import { MessageSquare, UserPlus, Zap, Bot, Calendar, ChevronDown, CheckCircle2, Handshake, CheckCircle } from 'lucide-react';

export default function DashboardView({ chats, leads }) {
  // Calculamos los stats usando los datos reales
  const totalChats = chats.length;
  const newLeads = leads.filter(l => l.stage === 'Nuevo').length;
  
  // Asumiendo que respondido es cualquier chat que el último mensaje es del agente ('user'/'ia' representados en messages)
  // Pero por ahora pondremos un cálculo básico.
  const botChats = chats.filter(c => c.status === 'IA').length;
  const botEfficiency = totalChats > 0 ? Math.round((botChats / totalChats) * 100) : 0;

  const stats = [
    { label: 'TOTAL CHATS', value: totalChats.toString(), trend: '+12%', trendUp: true, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'NUEVOS LEADS', value: newLeads.toString(), trend: '+8%', trendUp: true, icon: UserPlus, color: 'text-teal-500', bg: 'bg-teal-50' },
    { label: 'TASA DE RESPUESTA', value: '94.2%', trend: '-2%', trendUp: false, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'EFICIENCIA DEL BOT', value: `${botEfficiency}%`, trend: '+5%', trendUp: true, icon: Bot, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const recentActivity = chats.slice(0, 5).map(chat => ({
    contact: chat.name,
    phone: chat.phone || 'N/A',
    message: chat.lastMessage,
    agent: chat.status === 'IA' ? 'Bot AI' : 'Agente',
    status: chat.unreadCount > 0 ? 'Pendiente' : 'Respondido',
    time: chat.timestamp,
    agentIcon: chat.status === 'IA' ? Bot : null
  }));

  const leadsCalificados = leads.filter(l => l.stage === 'Demo Programada').length;
  const leadsNegociacion = leads.filter(l => l.stage === 'Nuevo').length;
  const leadsCerrados = leads.filter(l => l.stage === 'Cerrado').length;

  const leadStages = [
    { label: 'CALIFICADOS', value: leadsCalificados.toString(), icon: CheckCircle2, bg: 'bg-green-50', text: 'text-green-600', border: 'border-l-4 border-green-500' },
    { label: 'NUEVOS', value: leadsNegociacion.toString(), icon: Handshake, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-l-4 border-emerald-500' },
    { label: 'CERRADOS', value: leadsCerrados.toString(), icon: CheckCircle, bg: 'bg-orange-50/50', text: 'text-orange-600', border: 'border-l-4 border-orange-500' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 flex flex-col h-full">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Panel de Control</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Resumen de rendimiento.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1 ${stat.trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-800">{stat.value}</h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lead Status */}
      <div className="mb-8">
        {/* Estado de Leads */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800">Estado de Leads</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5 mb-6">Etapas de conversión actuales</p>
          
          <div className="flex flex-col gap-4">
            {leadStages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={i} className={`rounded-xl p-5 ${stage.bg} ${stage.border} flex justify-between items-center`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stage.label}</p>
                    <h4 className={`text-3xl font-bold ${stage.text}`}>{stage.value}</h4>
                  </div>
                  <Icon className={`h-8 w-8 opacity-50 ${stage.text}`} />
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Actividad Reciente */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 flex-1 min-h-[300px]">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-slate-800">Actividad Reciente WhatsApp</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                <th className="pb-4 font-bold">CONTACTO</th>
                <th className="pb-4 font-bold">ÚLTIMO MENSAJE</th>
                <th className="pb-4 font-bold text-center">AGENTE</th>
                <th className="pb-4 font-bold text-center">ESTADO</th>
                <th className="pb-4 font-bold text-right">HORA</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((act, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${act.contact}`} className="h-full w-full rounded-full" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{act.contact}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{act.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-slate-500 font-medium italic max-w-[200px] truncate">"{act.message}"</td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700">
                      {act.agentIcon ? <Bot className="h-4 w-4 text-green-500" /> : <div className="h-4 w-4 rounded-full bg-slate-200"></div>}
                      {act.agent}
                    </div>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      act.status === 'Respondido' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {act.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-xs text-slate-500 font-semibold">{act.time}</td>
                </tr>
              ))}
              {recentActivity.length === 0 && (
                <tr><td colSpan="5" className="text-center py-8 text-slate-500">Sin actividad reciente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
