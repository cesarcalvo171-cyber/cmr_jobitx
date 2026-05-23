import React, { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Contact, 
  MessageSquare, 
  Settings
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Sidebar({ activeTab, setActiveTab, onOpenNewChat }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads', icon: Target },
    { id: 'contacts', label: 'Contacts', icon: Contact },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center px-5 py-3.5 my-1 text-sm font-semibold transition-all duration-200 group ${
          isActive 
            ? 'bg-green-500 text-white border-l-4 border-green-700' 
            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border-l-4 border-transparent'
        }`}
      >
        <Icon className={`mr-4 h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="w-[260px] flex flex-col h-full shrink-0 select-none shadow-xl z-20"
      style={{ backgroundColor: 'var(--bg-sidebar)' }}>
      
      {/* Brand Header */}
      <div className="px-6 py-8 flex flex-col">
        <h1 className="font-bold text-white text-xl tracking-tight font-outfit flex items-center gap-2">
          Jobitx CRM
        </h1>
        <span className="text-[10px] font-bold text-green-400 tracking-widest uppercase mt-1">
          Enterprise Tier
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <div>{navigation.map(renderLink)}</div>
      </div>
      
      {/* Bottom Area */}
      <div className="p-5 flex flex-col gap-4">
        <button
          onClick={onOpenNewChat}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
        >
          <span className="text-lg leading-none">+</span> New Chat
        </button>
      </div>
    </aside>
  );
}
