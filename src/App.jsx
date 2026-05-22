import React, { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Clientes from './components/Clientes';
import WhatsappSetup from './components/WhatsappSetup';
import AIAgentSetup from './components/AIAgentSetup';
import FunnelBoard from './components/FunnelBoard';
import { Sparkles, BarChart2, Calendar, FileText, Settings, FileCheck, HelpCircle } from 'lucide-react';

import { useCRMStore } from './store/crmStore';
import { supabase } from './lib/supabase';

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

  const activeChat = chats.find(c => c.id === activeChatId);

  // Inicialización de datos y subscripción Realtime
  useEffect(() => {
    fetchChats();
    fetchClients();
    fetchLeads();

    // Suscribirse a inserciones en la tabla 'messages' vía Supabase Realtime
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          handleRealtimeMessage(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = (chatId, text) => {
    sendMessage(chatId, text);
  };

  const handleToggleStatus = (chatId, newStatus) => {
    toggleBotStatus(chatId, newStatus);
  };

  const handleAddClient = (newClient) => {
    addClient(newClient);
  };

  const handleDeleteClient = (clientId) => {
    deleteClient(clientId);
  };

  const handleMoveLead = (leadId, nextStage) => {
    moveLead(leadId, nextStage);
  };

  const handleAddLead = (newLead) => {
    addLead(newLead);
  };

  // Renderizar pestañas en desarrollo
  const renderInDevelopment = (tabName, IconComponent) => {
    return (
      <div className="flex-1 bg-slate-50/50 flex flex-col items-center justify-center p-8 select-none">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="h-16 w-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm mb-6">
            <IconComponent className="h-7 w-7 text-slate-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-2">Módulo: {tabName}</h2>
          <p className="text-xs text-slate-400 font-semibold mb-6">
            Esta pantalla está diseñada como parte del ecosistema de TalosFlow CRM y estará activa en la siguiente fase de desarrollo.
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl">
            <Sparkles className="h-3 w-3 text-emerald-600 animate-pulse" />
            <span>Futura Integración de TalosFlow</span>
          </div>
        </div>
      </div>
    );
  };

  // Router interno
  const renderMainContent = () => {
    switch (activeTab) {
      case 'conversaciones':
        return (
          <div className="flex-1 flex h-full overflow-hidden relative">
            <ChatList 
              chats={chats}
              activeChatId={activeChatId}
              setActiveChatId={setActiveChatId}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <ChatWindow 
              chat={activeChat}
              onSendMessage={handleSendMessage}
              onToggleStatus={handleToggleStatus}
            />
          </div>
        );
      case 'clientes':
        return (
          <Clientes 
            clients={clients}
            onAddClient={handleAddClient}
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'whatsapp':
        return <WhatsappSetup />;
      case 'agente_ia':
        return <AIAgentSetup />;
      case 'funnel':
        return (
          <FunnelBoard 
            leads={leads}
            onMoveLead={handleMoveLead}
            onAddLead={handleAddLead}
          />
        );
      case 'reportes':
        return renderInDevelopment('Reportes Avanzados', BarChart2);
      case 'agenda':
        return renderInDevelopment('Calendario y Agenda', Calendar);
      case 'plantillas':
        return renderInDevelopment('Plantillas de Respuesta', FileText);
      case 'panel_admin':
        return renderInDevelopment('Panel de Administración', Settings);
      case 'solicitudes_demo':
        return renderInDevelopment('Solicitudes de Demos', FileCheck);
      case 'ayuda':
        return renderInDevelopment('Centro de Ayuda', HelpCircle);
      default:
        return renderInDevelopment('En desarrollo', Sparkles);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 h-full min-w-0 flex flex-col overflow-hidden relative">
        {loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white px-4 py-2 rounded-full shadow border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sincronizando con Supabase...
          </div>
        )}
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
