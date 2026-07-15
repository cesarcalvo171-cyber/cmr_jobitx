import React, { useState } from 'react';
import {
  Search, Phone, Mail, ArrowLeft, Calendar,
  User2, Bot, UserCheck, MessageSquare, Tag,
  FileText, Ban, Eye, X, Send, PlayCircle, Clock, Archive, TrendingUp, DollarSign, Download
} from 'lucide-react';
import { useCRMStore } from '../store/crmStore';
import { exportToCsv } from '../lib/exportCsv';

export default function Clientes({ clients = [] }) {
  const { 
    chats, 
    updateConversationStatus, 
    toggleBotStatus, 
    sendMessage,
    setActiveTab,
    setActiveChatId,
    addClient 
  } = useCRMStore();

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [search, setSearch] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalInputText, setModalInputText] = useState('');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ monto: '', reason: '', stage: 'Nuevo' });

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // Buscar la conversación correspondiente en la lista global de chats
  const activeChat = selectedClient
    ? chats.find((chat) => chat.id === selectedClient.chatId || chat.phone === selectedClient.phone)
    : null;

  const handleOpenDetails = (client) => {
    setSelectedClientId(client.id);
    setIsDetailModalOpen(true);
  };

  const handleExportExcel = () => {
    const headers = ['Nombre Cliente', 'WhatsApp', 'Estado del Chat', 'Modo Atención', 'Fecha Registro'];
    const rows = clients.map((c) => {
      const matchingChat = chats.find(chat => chat.id === c.chatId || chat.phone === c.phone);
      return [
        c.name || 'Sin Nombre',
        c.phone || '',
        matchingChat ? matchingChat.convStatus : c.convStatus || 'En Ejecución',
        matchingChat ? (matchingChat.status === 'IA' ? 'Bot IA' : 'Humano') : (c.botEnabled ? 'Bot IA' : 'Humano'),
        c.creationDate || ''
      ];
    });
    exportToCsv('Directorio_Clientes', headers, rows);
  };

  const handleStatusChange = async (newStatus) => {
    if (activeChat) {
      await updateConversationStatus(activeChat.id, newStatus);
    }
  };

  const handleToggleBot = async () => {
    if (activeChat) {
      const next = activeChat.status === 'IA' ? 'Humano' : 'IA';
      await toggleBotStatus(activeChat.id, next);
    }
  };

  const handleSendFromModal = async (e) => {
    e.preventDefault();
    if (!modalInputText.trim() || !activeChat) return;
    await sendMessage(activeChat.id, modalInputText.trim());
    setModalInputText('');
  };

  const handleGoToChat = (chatId) => {
    if (chatId) {
      setActiveChatId(chatId);
      setActiveTab('chats');
    }
  };

  const handleConvertToLead = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;
    await addClient({
      name: selectedClient.name,
      phone: selectedClient.phone,
      monto: parseFloat(leadForm.monto) || 0,
      stage: leadForm.stage,
      reason: leadForm.reason
    });
    // Usar el store de leads directamente
    const { addLead } = useCRMStore.getState();
    await addLead({
      name: selectedClient.name,
      phone: selectedClient.phone,
      monto: parseFloat(leadForm.monto) || 0,
      stage: leadForm.stage,
      reason: leadForm.reason || `Convertido desde chat: ${selectedClient.name}`
    });
    setLeadForm({ monto: '', reason: '', stage: 'Nuevo' });
    setIsLeadFormOpen(false);
  };

  return (
    <div className="flex-1 overflow-hidden bg-slate-50 p-4 md:p-8 flex flex-col h-full">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight font-outfit">
            Directorio de Clientes
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {clients.length} contactos registrados en el CRM
          </p>
        </div>

        {/* CONTROLES DE CABECERA */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 h-11 bg-white hover:bg-slate-100 text-slate-700 rounded-2xl text-xs font-bold transition-all border border-slate-200 shadow-sm shrink-0"
          >
            <Download className="h-4 w-4" />
            Exportar Excel
          </button>
          
          {/* SEARCH */}
          <div className="relative flex-1 lg:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE CLIENTES */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-400">
                <th className="px-6 py-4">CLIENTE</th>
                <th className="px-6 py-4">TELÉFONO</th>
                <th className="px-6 py-4 text-center">ESTADO CHAT</th>
                <th className="px-6 py-4 text-right">ACCIONES</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => {
                const matchingChat = chats.find(c => c.id === client.chatId || c.phone === client.phone);
                const convStatus = matchingChat ? matchingChat.convStatus : client.convStatus || 'En Ejecución';
                const isBotActive = matchingChat ? matchingChat.status === 'IA' : client.botEnabled;

                return (
                  <tr
                    key={client.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* CLIENTE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 text-sm truncate">
                            {client.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-medium truncate">
                            {client.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-700 text-sm">
                        {client.phone}
                      </span>
                    </td>

                    {/* ESTADO CONVERSACIÓN */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border ${
                        convStatus === 'En Ejecución' || convStatus === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : convStatus === 'Pendiente' || convStatus === 'snoozed'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {convStatus === 'Pendiente' ? <Clock className="h-3 w-3" /> : convStatus === 'Cerrado' ? <Archive className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />}
                        {convStatus}
                      </span>
                    </td>

                    {/* BOTÓN VER MÁS DETALLES */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(client)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-700 font-bold text-xs transition-all shadow-sm"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-400 font-medium">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLES DEL CLIENTE Y HITO DE CONVERSACIÓN */}
      {isDetailModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
            
            {/* PANEL IZQUIERDO: INFORMACIÓN DEL CLIENTE Y CONTROLES ADMIN */}
            <div className="w-full md:w-80 bg-slate-50 border-r border-slate-200 p-6 flex flex-col overflow-y-auto shrink-0">
              
              {/* ENCABEZADO CLIENTE */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200">
                <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-2xl text-white shadow-md mb-3">
                  {selectedClient.name.substring(0, 2).toUpperCase()}
                </div>
                <h2 className="text-lg font-black text-slate-800">{selectedClient.name}</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{selectedClient.phone}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedClient.email}</p>
              </div>

              {/* CONTROLES DE ADMINISTRACIÓN */}
              <div className="py-6 border-b border-slate-200 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Control de Administrador
                </p>

                {/* CAMBIAR ESTADO DE LA CONVERSACIÓN */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Estado de la Conversación
                  </label>
                  <select
                    value={activeChat ? activeChat.convStatus : selectedClient.convStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                  >
                    <option value="En Ejecución">🟢 En Ejecución (Activo)</option>
                    <option value="Pendiente">🟡 Pendiente</option>
                    <option value="Cerrado">🔴 Cerrado / Archivado</option>
                  </select>
                </div>

                {/* CAMBIAR MODO BOT (IA vs HUMANO) */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Atención Inteligente
                  </label>
                  <button
                    onClick={handleToggleBot}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      activeChat && activeChat.status === 'IA'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {activeChat && activeChat.status === 'IA' ? (
                      <><Bot className="h-4 w-4" /> Desactivar Bot (Pasar a Humano)</>
                    ) : (
                      <><UserCheck className="h-4 w-4" /> Activar Bot IA</>
                    )}
                  </button>
                </div>
              </div>

              {/* DATOS ADICIONALES */}
              <div className="py-6 space-y-4 flex-1">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Registro</p>
                  <p className="text-xs font-bold text-slate-700">{selectedClient.creationDate}</p>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Etiquetas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedClient.labels && selectedClient.labels.length > 0 ? (
                      selectedClient.labels.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800">
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Sin etiquetas</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Notas</p>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 italic">
                    {selectedClient.notes || 'Sin notas adicionles.'}
                  </div>
                </div>
              </div>

              {/* BOTONES DE ACCION */}
              <div className="space-y-2">
                {/* IR AL CHAT */}
                {activeChat && (
                  <button
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      handleGoToChat(activeChat.id);
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageSquare className="h-4 w-4" /> Ir a la pantalla de Chat
                  </button>
                )}

                {/* CONVERTIR A LEAD */}
                {!isLeadFormOpen ? (
                  <button
                    onClick={() => setIsLeadFormOpen(true)}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <TrendingUp className="h-4 w-4" /> Convertir en Prospecto de Prestamo
                  </button>
                ) : (
                  <form onSubmit={handleConvertToLead} className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2">
                    <p className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-widest">Registrar Prestamo</p>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                      <input
                        type="number"
                        placeholder="Monto (ej: 2000)"
                        value={leadForm.monto}
                        onChange={(e) => setLeadForm({ ...leadForm, monto: e.target.value })}
                        min="0"
                        className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
                        required
                      />
                    </div>
                    <select
                      value={leadForm.stage}
                      onChange={(e) => setLeadForm({ ...leadForm, stage: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Prestamo Programado">Prestamo Programado</option>
                      <option value="Prestamo Cerrado">Prestamo Cerrado</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Nota (ej: para capital de trabajo)"
                      value={leadForm.reason}
                      onChange={(e) => setLeadForm({ ...leadForm, reason: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-700"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsLeadFormOpen(false)} className="flex-1 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">Cancelar</button>
                      <button type="submit" className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold">Guardar</button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* PANEL DERECHO: VISUALIZADOR DE HISTORIAL DE MENSAJES */}
            <div className="flex-1 flex flex-col bg-white min-h-[400px]">
              
              {/* HEADER MODAL DERECHO */}
              <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Historial de Conversación con {selectedClient.name}</h3>
                  <p className="text-[10px] font-semibold text-slate-400">Mensajes de WhatsApp guardados en el CRM</p>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* LISTA DE MENSAJES EMBEBIDA */}
              <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/30">
                {activeChat && activeChat.messages && activeChat.messages.length > 0 ? (
                  activeChat.messages.map((msg) => {
                    const isClient = msg.sender === 'client';
                    return (
                      <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] flex flex-col ${isClient ? 'items-start' : 'items-end'}`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isClient
                              ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                              : msg.sender === 'ia'
                                ? 'bg-indigo-600 text-white rounded-tr-xs'
                                : 'bg-emerald-600 text-white rounded-tr-xs'
                          }`}>
                            <p className="font-semibold">{msg.text}</p>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 px-1">
                            {msg.sender === 'ia' ? 'Bot IA' : msg.sender === 'client' ? 'Cliente' : 'Admin'} • {msg.time}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400 gap-2">
                    <MessageSquare className="h-10 w-10 text-slate-300" />
                    <p className="text-xs font-bold text-slate-600">No se registra conversación previa</p>
                    <p className="text-[11px] text-slate-400">Cuando el cliente escriba por WhatsApp o envíes un mensaje, se mostrará aquí.</p>
                  </div>
                )}
              </div>

              {/* INPUT PARA RESPONDER RÁPIDAMENTE DESDE EL MODAL */}
              {activeChat && (
                <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                  <form onSubmit={handleSendFromModal} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Escribir respuesta rápida..."
                      value={modalInputText}
                      onChange={(e) => setModalInputText(e.target.value)}
                      className="flex-1 h-10 px-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!modalInputText.trim()}
                      className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                    >
                      <Send className="h-3.5 w-3.5" /> Enviar
                    </button>
                  </form>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}