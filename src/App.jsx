import React, { useEffect, useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Clientes from './components/Clientes';
import FunnelBoard from './components/FunnelBoard';
import DashboardView from './components/DashboardView';
import PromptConfig from './components/PromptConfig';
import { Search, Bell, HelpCircle, Menu, X, ArrowLeft, LogOut, ShieldCheck, CheckCheck, MessageSquare, Info, BookOpen } from 'lucide-react';

import { useCRMStore } from './store/crmStore';
import { supabase } from './lib/supabase';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

function App() {
  const {
    activeTab, setActiveTab,
    chats, clients, leads,
    activeChatId, setActiveChatId,
    searchQuery, setSearchQuery,
    fetchChats, fetchClients, fetchLeads,
    sendMessage, toggleBotStatus,
    handleRealtimeMessage,
    loading
  } = useCRMStore();

  const [profile, setProfile] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Estados de Modales y Popovers de la Cabecera
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId);
  const unreadChats = chats.filter(c => c.unreadCount > 0);

  useEffect(() => {
    fetchChats();
    fetchClients();
    fetchLeads();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email);
        fetchProfile(session.user.id);
      }
    });

    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => handleRealtimeMessage(payload)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const handleSendMessage = (chatId, text) => sendMessage(chatId, text);
  const handleToggleStatus = (chatId, newStatus) => toggleBotStatus(chatId, newStatus);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // Router interno de pestañas
  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView chats={chats} leads={leads} />;
      case 'chats':
        return (
          <div className="flex-1 flex h-full overflow-hidden relative">
            <div className={`w-full md:w-[320px] shrink-0 h-full border-r border-slate-200 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
              <ChatList 
                chats={chats} activeChatId={activeChatId} setActiveChatId={setActiveChatId}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
              />
            </div>
            <div className={`flex-1 h-full ${!activeChatId ? 'hidden md:flex' : 'flex flex-col'}`}>
              {activeChatId && (
                <button 
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden flex items-center gap-1.5 p-4 border-b border-slate-100 bg-white text-slate-600 font-bold text-xs text-left"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a la lista
                </button>
              )}
              <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} onToggleStatus={handleToggleStatus} />
            </div>
          </div>
        );
      case 'contacts':
        return <Clientes clients={clients} />;
      case 'leads':
        return <FunnelBoard leads={leads} onAddLead={useCRMStore.getState().addLead} />;
      case 'settings':
        return <PromptConfig />;
      default:
        return <DashboardView chats={chats} leads={leads} />;
    }
  };

  const DashboardLayout = () => (
    <div className="flex h-screen w-screen overflow-hidden font-sans relative" style={{ backgroundColor: 'var(--bg-base)' }}>
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex h-full shrink-0">
        <Sidebar activeTab={activeTab || 'dashboard'} setActiveTab={setActiveTab} />
      </div>

      {/* Sidebar Drawer - Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex flex-col w-[250px] h-full bg-slate-900 animate-slide-in">
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar 
              activeTab={activeTab || 'dashboard'} 
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }} 
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="w-[200px] md:w-[360px] relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar prospecto o cliente..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100/80 border-none rounded-full py-2.5 pl-11 pr-4 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 placeholder-slate-400"
              />
            </div>
            <h1 className="lg:hidden font-black text-slate-800 text-lg tracking-tight font-outfit sm:hidden">
              Jobitx CRM
            </h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            
            {/* BOTÓN 1: NOTIFICACIONES */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsHelpOpen(false);
                  setIsProfileOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-2xl hover:bg-slate-100 transition-colors relative"
                title="Notificaciones"
              >
                <Bell className="h-5 w-5" />
                {unreadChats.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {/* POPOVER DE NOTIFICACIONES */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-fadeInUp">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-3">
                    <h4 className="font-black text-slate-800 text-sm">Notificaciones</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {unreadChats.length} sin leer
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {unreadChats.length > 0 ? (
                      unreadChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => {
                            setActiveChatId(chat.id);
                            setActiveTab('chats');
                            setIsNotificationsOpen(false);
                          }}
                          className="p-3 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 cursor-pointer transition-all flex items-start gap-3"
                        >
                          <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{chat.name}</p>
                            <p className="text-[11px] text-slate-500 truncate">{chat.lastMessage}</p>
                            <span className="text-[9px] font-semibold text-slate-400">{chat.timestamp}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 font-medium text-xs">
                        No hay mensajes pendientes por responder.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* BOTÓN 2: CENTRO DE AYUDA (?) */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsHelpOpen(!isHelpOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className="text-slate-500 hover:text-slate-800 p-2 rounded-2xl hover:bg-slate-100 transition-colors"
                title="Centro de Ayuda"
              >
                <HelpCircle className="h-5 w-5" />
              </button>

              {/* MODAL DE AYUDA */}
              {isHelpOpen && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-50 animate-fadeInUp">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                      <h4 className="font-black text-slate-800 text-sm">Guía del Sistema CRM</h4>
                    </div>
                    <button onClick={() => setIsHelpOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-bold text-slate-800 mb-1">💼 Préstamos y Prospectos</p>
                      <p>Registra montos solicitados y mueve los prospectos a través del pipeline (*Nuevo → En Proceso → Programado → Cerrado*).</p>
                    </div>

                    <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-indigo-900">
                      <p className="font-bold mb-1">🤖 Control del Bot de IA</p>
                      <p>Cambia entre **Modo IA** (respuesta automática) y **Modo Humano** (control manual del asesor) directamente desde la cabecera de cada chat.</p>
                    </div>

                    <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-emerald-900">
                      <p className="font-bold mb-1">📊 Exportación a Excel</p>
                      <p>Descarga tus prospectos y clientes en CSV compatible con Microsoft Excel usando el botón **Exportar Excel**.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* BOTÓN 3: PERFIL DE USUARIO Y CERRAR SESIÓN */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                  setIsHelpOpen(false);
                }}
                className="flex items-center gap-2 md:gap-3 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors text-left"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-800 leading-tight">{profile?.full_name || 'Admin Manager'}</p>
                  <p className="text-[9px] font-bold text-emerald-600">En línea</p>
                </div>
                <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-sm text-xs shrink-0">
                  {(profile?.full_name || 'A M').split(' ').map(n=>n[0]).join('')}
                </div>
              </button>

              {/* DROPDOWN DE PERFIL */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50 animate-fadeInUp">
                  <div className="pb-3 border-b border-slate-100 mb-3">
                    <p className="font-black text-slate-800 text-sm">{profile?.full_name || 'Admin Manager'}</p>
                    <p className="text-xs font-semibold text-slate-400 truncate">{userEmail || 'admin@talosflow.local'}</p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3" /> Administrador CRM
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl text-xs font-bold transition-all"
                  >
                    <LogOut className="h-4 w-4" /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 h-full min-w-0 flex flex-col overflow-hidden relative">
          {loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-emerald-600 shadow-md border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Sincronizando...
            </div>
          )}
          {renderMainContent()}
        </main>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout/></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
