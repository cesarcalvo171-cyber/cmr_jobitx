import { useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Contact, 
  MessageSquare, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar({ activeTab, setActiveTab }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Préstamos', icon: Target },
    { id: 'contacts', label: 'Clientes', icon: Contact },
    { id: 'chats', label: 'Conversaciones', icon: MessageSquare },
    // { id: 'settings', label: 'Configuración IA', icon: Settings },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        title={isCollapsed ? item.label : undefined}
        className={`w-full flex items-center py-3.5 my-1 text-sm font-bold transition-all duration-200 group ${
          isCollapsed ? 'justify-center px-0' : 'px-6'
        } ${
          isActive 
            ? 'bg-emerald-600 text-white border-l-4 border-emerald-400 shadow-sm' 
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border-l-4 border-transparent'
        }`}
      >
        <Icon className={`h-5 w-5 shrink-0 transition-colors ${!isCollapsed && 'mr-4'} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
        {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
      </button>
    );
  };

  return (
    <aside className={`flex flex-col h-full shrink-0 select-none shadow-xl z-20 bg-slate-900 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[80px]' : 'w-[250px]'}`}>
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1">{navigation.map(renderLink)}</div>
      </div>
      
      {/* Toggle Button at Bottom */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ${
            !isCollapsed && 'justify-end'
          }`}
          title={isCollapsed ? "Expandir" : "Contraer"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
    </aside>
  );
}
