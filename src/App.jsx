import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Clientes from './components/Clientes';
import WhatsappSetup from './components/WhatsappSetup';
import AIAgentSetup from './components/AIAgentSetup';
import FunnelBoard from './components/FunnelBoard';
import DashboardView from './components/DashboardView';
import PromptConfig from './components/PromptConfig';
import NewChatModal from './components/NewChatModal';
import { Search, Bell, HelpCircle, Menu, X, ArrowLeft } from 'lucide-react';

import { useCRMStore } from './store/crmStore';
import { supabase } from './lib/supabase';

import { Routes, Route, Navigate } from 'react-router-dom';
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
    addClient, deleteClient,
    addLead, moveLead,
    handleRealtimeMessage,
    loading
  } = useCRMStore();

  const [profile, setProfile] = useState(null);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    fetchChats();
    fetchClients();
    fetchLeads();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
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
  const handleAddClient = (newClient) => addClient(newClient);
  const handleDeleteClient = (clientId) => deleteClient(clientId);
  const handleMoveLead = (leadId, nextStage) => moveLead(leadId, nextStage);
  const handleAddLead = (newLead) => addLead(newLead);

  // Router interno de pestañas con responsive adaptativo para Chats
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
                onOpenNewChat={() => setIsNewChatModalOpen(true)}
              />
            </div>
            <div className={`flex-1 h-full ${!activeChatId ? 'hidden md:flex' : 'flex flex-col'}`}>
              {activeChatId && (
                <button 
                  onClick={() => setActiveChatId(null)}
                  className="md:hidden flex items-center gap-1.5 p-4 border-b border-slate-100 bg-white text-slate-600 font-semibold text-xs text-left"
                >
                  <ArrowLeft className="h-4 w-4" /> Volver a la lista
                </button>
              )}
              <ChatWindow chat={activeChat} onSendMessage={handleSendMessage} onToggleStatus={handleToggleStatus} />
            </div>
          </div>
        );
      case 'contacts':
        return <Clientes clients={clients} onAddClient={handleAddClient} onDeleteClient={handleDeleteClient} />;
      case 'leads':
        return <FunnelBoard leads={leads} onMoveLead={handleMoveLead} onAddLead={handleAddLead} />;
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
        <Sidebar activeTab={activeTab || 'dashboard'} setActiveTab={setActiveTab} onOpenNewChat={() => setIsNewChatModalOpen(true)} />
      </div>

      {/* Sidebar Drawer - Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="relative flex flex-col w-[260px] h-full bg-slate-800 animate-slide-in">
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
              onOpenNewChat={() => {
                setIsNewChatModalOpen(true);
                setIsSidebarOpen(false);
              }} 
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="w-[200px] md:w-[400px] relative hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar clientes o mensajes..." 
                className="w-full bg-slate-100/70 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none text-slate-700 placeholder-slate-500 font-medium"
              />
            </div>
            <h1 className="lg:hidden font-bold text-slate-800 text-lg tracking-tight font-outfit sm:hidden">
              Jobitx CRM
            </h1>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="text-slate-400 hover:text-slate-600 relative p-1.5 rounded-lg">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white"></span>
            </button>
            <button className="text-slate-400 hover:text-slate-600 hidden sm:block p-1.5 rounded-lg">
              <HelpCircle className="h-5 w-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{profile?.full_name || 'Admin Manager'}</p>
                <p className="text-[10px] font-semibold text-slate-500">En línea</p>
              </div>
              <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold shadow-sm text-sm shrink-0">
                {(profile?.full_name || 'A M').split(' ').map(n=>n[0]).join('')}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 h-full min-w-0 flex flex-col overflow-hidden relative">
          {loading && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-green-600 shadow-md border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Sincronizando...
            </div>
          )}
          {renderMainContent()}
        </main>
      </div>

      {/* New Chat Modal */}
      <NewChatModal isOpen={isNewChatModalOpen} onClose={() => setIsNewChatModalOpen(false)} />
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
