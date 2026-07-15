import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Contact, 
  MessageSquare, 
  Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Préstamos', icon: Target },
    { id: 'contacts', label: 'Clientes', icon: Contact },
    { id: 'chats', label: 'Conversaciones', icon: MessageSquare },
    { id: 'settings', label: 'Configuración IA', icon: Settings },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center px-6 py-3.5 my-1 text-sm font-bold transition-all duration-200 group ${
          isActive 
            ? 'bg-emerald-600 text-white border-l-4 border-emerald-400 shadow-sm' 
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border-l-4 border-transparent'
        }`}
      >
        <Icon className={`mr-4 h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-[250px] flex flex-col h-full shrink-0 select-none shadow-xl z-20 bg-slate-900">
      
      {/* Brand Header */}
      <div className="px-6 py-8 flex flex-col">
        <h1 className="font-black text-white text-xl tracking-tight font-outfit flex items-center gap-2">
          Jobitx CRM
        </h1>
        <p className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest mt-1">
          WhatsApp & Loans
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div>{navigation.map(renderLink)}</div>
      </div>
      
    </aside>
  );
}
