import React from 'react';
import { 
  MessageSquare, 
  Users, 
  BarChart2, 
  Calendar, 
  FileText, 
  MessageCircle, 
  Bot, 
  BookOpen, 
  Kanban, 
  Webhook, 
  Settings, 
  FileCheck, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const mainNavigation = [
    { id: 'conversaciones', label: 'Conversaciones', icon: MessageSquare },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'reportes', label: 'Reportes', icon: BarChart2 },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'plantillas', label: 'Plantillas', icon: FileText },
  ];

  const configNavigation = [
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
    { id: 'agente_ia', label: 'Agente IA', icon: Bot },
    { id: 'conocimiento', label: 'Conocimiento', icon: BookOpen },
    { id: 'funnel', label: 'Funnel', icon: Kanban },
    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
  ];

  const adminNavigation = [
    { id: 'panel_admin', label: 'Panel Admin', icon: Settings },
    { id: 'solicitudes_demo', label: 'Solicitudes Demo', icon: FileCheck },
    { id: 'ayuda', label: 'Ayuda', icon: HelpCircle },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center px-4 py-2.5 my-0.5 text-sm font-medium rounded-xl transition-all duration-200 ${
          isActive 
            ? 'bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50' 
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon className={`mr-3 h-5 w-5 shrink-0 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-[260px] border-r border-slate-100 bg-white flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex flex-col">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-base tracking-tight font-outfit">TalosFlow</span>
            <span className="text-[10px] font-semibold text-slate-400 -mt-1 tracking-wider uppercase">Administrador</span>
          </div>
        </div>

        {/* Viewing Agent pill */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-50/70 border border-emerald-100/60 rounded-full w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-800">Viendo: Erik Taveras</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Main section */}
        <div>
          <div className="space-y-0.5">
            {mainNavigation.map(renderLink)}
          </div>
        </div>

        {/* Config section */}
        <div>
          <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Configuración</h3>
          <div className="space-y-0.5">
            {configNavigation.map(renderLink)}
          </div>
        </div>

        {/* Admin section */}
        <div>
          <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Administración</h3>
          <div className="space-y-0.5">
            {adminNavigation.map(renderLink)}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-100 flex flex-col gap-3">
        {/* Exit view button */}
        <button 
          onClick={() => alert("Saliendo de la vista...")}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50/50 rounded-xl transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-emerald-600 rotate-180" />
          <span>Salir de vista</span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
              A
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 leading-none">Administrador</span>
              <span className="text-[10px] text-slate-400 mt-0.5">admin@crm.local</span>
            </div>
          </div>
          <button 
            onClick={() => alert("Configuración de perfil...")}
            className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
