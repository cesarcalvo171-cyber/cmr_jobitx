import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Clientes from './components/Clientes';
import WhatsappSetup from './components/WhatsappSetup';
import AIAgentSetup from './components/AIAgentSetup';
import FunnelBoard from './components/FunnelBoard';
import { initialChats, initialClients, initialLeads } from './data/mockData';
import { Sparkles, BarChart2, Calendar, FileText, Settings, FileCheck, HelpCircle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('conversaciones');
  
  // Dynamic datasets
  const [chats, setChats] = useState(initialChats);
  const [clients, setClients] = useState(initialClients);
  const [leads, setLeads] = useState(initialLeads);
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected chat details
  const activeChat = chats.find(c => c.id === activeChatId);

  // Send Message Logic
  const handleSendMessage = (chatId, text) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add user message
    setChats(prevChats => 
      prevChats.map(chat => {
        if (chat.id === chatId) {
          const updatedMessages = [
            ...chat.messages,
            { id: Date.now(), sender: 'user', text, time: timeNow }
          ];
          return {
            ...chat,
            messages: updatedMessages,
            lastMessage: text,
            timestamp: timeNow,
            unreadCount: 0
          };
        }
        return chat;
      })
    );

    // If chat is managed by AI, trigger automatic AI reply
    const targetChat = chats.find(c => c.id === chatId);
    if (targetChat && targetChat.status === 'IA') {
      setTimeout(() => {
        const botReply = getBotResponse(text, targetChat.name);
        const timeReply = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setChats(prevChats => 
          prevChats.map(chat => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: [
                  ...chat.messages,
                  { id: Date.now() + 1, sender: 'ia', text: botReply, time: timeReply }
                ],
                lastMessage: botReply,
                timestamp: timeReply
              };
            }
            return chat;
          })
        );
      }, 1500);
    }
  };

  // Chatbot Auto Responses Generator
  const getBotResponse = (text, clientName) => {
    const query = text.toLowerCase();
    
    if (query.includes('precio') || query.includes('costo') || query.includes('plan') || query.includes('valora')) {
      return `¡Hola de nuevo ${clientName}! Nuestros planes comerciales inician en $49 USD/mes (Plan Pro) con acceso a WhatsApp ilimitado y nuestro motor básico de Agente IA. El Plan Enterprise de $120 USD/mes te da soporte multicanal y mayor capacidad de procesamiento.`;
    }
    
    if (query.includes('demo') || query.includes('reunion') || query.includes('agendar') || query.includes('cita')) {
      return `¡Perfecto! Me encantaría agendar un espacio para que Erik Taveras te muestre todas las capacidades de la plataforma. Puedes elegir el horario que mejor te convenga en el siguiente enlace: https://calendly.com/talosflow/demo-gratuita`;
    }

    if (query.includes('webhook') || query.includes('api') || query.includes('integracion')) {
      return `¡Excelente pregunta! TalosFlow cuenta con soporte nativo para Webhooks de salida y entrada. Puedes conectarlo con Stripe, HubSpot, Shopify o cualquier CRM externo directamente desde tu Panel de Configuración en menos de 5 minutos.`;
    }

    return `He recibido tu mensaje, ${clientName}. Permíteme analizar la consulta para brindarte la mejor respuesta. Recuerda que si deseas agendar nuestra videollamada de demostración comercial con Erik Taveras, solo debes pedírmelo.`;
  };

  // Toggle Human / AI triage
  const handleToggleStatus = (chatId, newStatus) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, status: newStatus } : chat
      )
    );
  };

  // Client addition / deletion
  const handleAddClient = (newClient) => {
    setClients(prev => [newClient, ...prev]);
  };

  const handleDeleteClient = (clientId) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Kanban Leads Operations
  const handleMoveLead = (leadId, nextStage) => {
    setLeads(prev => 
      prev.map(lead => lead.id === leadId ? { ...lead, stage: nextStage } : lead)
    );
  };

  const handleAddLead = (newLead) => {
    setLeads(prev => [newLead, ...prev]);
  };

  // Render Subsections for Pending Tabs
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

  // Content Router
  const renderMainContent = () => {
    switch (activeTab) {
      case 'conversaciones':
        return (
          <div className="flex-1 flex h-full overflow-hidden">
            <ChatList 
              chats={chats}
              activeChatId={activeChatId}
              setActiveChatId={(id) => {
                setActiveChatId(id);
                // Proactively clear unread badge on click
                setChats(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
              }}
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
      {/* Sidebar - Always visible */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Variable workspace layout */}
      <main className="flex-1 h-full min-w-0 flex flex-col overflow-hidden">
        {renderMainContent()}
      </main>
    </div>
  );
}

export default App;
