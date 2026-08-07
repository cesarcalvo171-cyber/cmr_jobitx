import { useState, useRef, useEffect } from 'react';
import {
  Send, Smile, MessageSquare,
  CheckCheck, Bot, UserCheck, Tag, FileText, Ban, Info,
  PlayCircle, Clock, Archive, Trash2, TrendingUp, X
} from 'lucide-react';
import { useCRMStore } from '../store/crmStore';

export default function ChatWindow({ chat, onSendMessage, onToggleStatus }) {
  const { updateConversationStatus, deleteChat, addLead } = useCRMStore();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Estados para modales y formularios en sidebar
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({ monto: '', reason: '', stage: 'Nuevo' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  // Scroll al último mensaje cuando cambia la lista
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  // Limpiar input al cambiar de conversación
  useEffect(() => {
    setInputText('');
  }, [chat?.id]);

  // ─── Sin chat seleccionado ────────────────────────────────────────────────
  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 select-none gap-4">
        <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 border border-slate-100">
          <MessageSquare className="h-9 w-9" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-slate-700">Selecciona una conversación</h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Los mensajes de WhatsApp aparecerán en vivo aquí.</p>
        </div>
      </div>
    );
  }

  // ─── Estados derivados ────────────────────────────────────────────────────
  const isBotActive = chat.status === 'IA';
  const convStatus = chat.convStatus || 'En Ejecución';
  const initials = chat.name
    ? chat.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  // ─── Enviar mensaje ───────────────────────────────────────────────────────
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;
    setSending(true);
    await onSendMessage(chat.id, inputText.trim());
    setInputText('');
    setSending(false);
  };

  // ─── Toggle bot ───────────────────────────────────────────────────────────
  const handleToggle = () => {
    const next = isBotActive ? 'Humano' : 'IA';
    onToggleStatus(chat.id, next);
  };

  // ─── Cambiar estado conversación ──────────────────────────────────────────
  const handleConvStatusChange = (newStatus) => {
    updateConversationStatus(chat.id, newStatus);
  };

  // ─── Convertir a Prospecto (Lead) ─────────────────────────────────────────
  const handleConvertToLead = async (e) => {
    e.preventDefault();
    if (!chat) return;
    await addLead({
      name: chat.name || 'Sin Nombre',
      phone: chat.phone,
      monto: parseFloat(leadForm.monto) || 0,
      stage: leadForm.stage,
      reason: leadForm.reason || `Convertido desde chat: ${chat.name}`
    });
    setLeadForm({ monto: '', reason: '', stage: 'Nuevo' });
    setIsLeadFormOpen(false);
  };

  // ─── Eliminar conversación con razón ──────────────────────────────────────
  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) return;
    console.log(`Eliminando conversación ${chat.id}. Razón: ${deleteReason}`);
    deleteChat(chat.id);
    setIsDeleteModalOpen(false);
    setDeleteReason('');
  };

  return (
    <div className="flex-1 flex h-full min-w-0 bg-white">

      {/* ─── Área de Chat ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-slate-100">

        {/* Cabecera del Chat con Controles de Admin */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Minimalista */}
            <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm truncate">{chat.name}</h3>
              <p className="text-xs font-medium text-slate-500 truncate">{chat.phone}</p>
            </div>
          </div>

          {/* Barra de Controles de Admin */}
          <div className="flex items-center gap-3">
            
            {/* Selector de Estado de la Conversación */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg pr-1">
              <span className="text-[10px] font-bold text-slate-400 pl-3 hidden sm:inline">Estado:</span>
              <select
                value={convStatus}
                onChange={(e) => handleConvStatusChange(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 py-2 px-2 focus:outline-none cursor-pointer"
              >
                <option value="En Ejecución">Activo</option>
                <option value="Pendiente">En Espera</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            {/* Botón Toggle IA / Humano */}
            <button
              onClick={handleToggle}
              title={isBotActive ? 'La IA está respondiendo automáticamente. Clic para pasar a control Humano.' : 'Estás respondiendo manualmente. Clic para reactivar la IA.'}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 shrink-0 ${
                isBotActive
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isBotActive ? (
                <><Bot className="h-3.5 w-3.5" /> Modo IA</>
              ) : (
                <><UserCheck className="h-3.5 w-3.5" /> Modo Manual</>
              )}
            </button>

          </div>
        </div>

        {/* ─── Mensajes ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-transparent">

          {/* Sin mensajes */}
          {(!chat.messages || chat.messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <MessageSquare className="h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">Aún no hay mensajes.</p>
            </div>
          )}

          {/* Lista de mensajes recibidos/enviados */}
          {chat.messages?.map((msg) => {
            const isClient = msg.sender === 'client';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-4">
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-3 py-1 rounded-md">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[70%] flex flex-col ${isClient ? 'items-start' : 'items-end'}`}>
                  {/* Estilo Messenger */}
                  <div className={`px-4 py-2 text-sm leading-relaxed ${
                    isClient
                      ? 'bg-slate-200 text-slate-900 rounded-2xl rounded-bl-sm'
                      : 'bg-blue-700 text-white rounded-2xl rounded-br-sm'
                  }`}>
                    {msg.text}
                  </div>
                  
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] font-medium text-slate-400">
                      {msg.sender === 'ia' ? 'Bot' : msg.sender === 'client' ? 'Cliente' : 'Tú'} • {msg.time}
                    </span>
                    {!isClient && (
                      <CheckCheck className={`h-3 w-3 ${msg.status === 'read' ? 'text-blue-500' : 'text-slate-300'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Área de Input ─────────────────────────────────────────────────── */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">

          {/* Aviso contextual minimalista */}
          {isBotActive && (
            <div className="mb-3 px-4 py-2 bg-blue-100 rounded-lg flex items-center justify-between text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-slate-400" />
                La IA está respondiendo automáticamente.
              </span>
              <button 
                onClick={handleToggle}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 underline underline-offset-2"
              >
                Responder manualmente
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:bg-white focus-within:border-slate-300 transition-colors">
           
            <input
              type="text"
              placeholder={isBotActive ? 'Toma el control para responder...' : 'Escribe un mensaje...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none py-1.5 text-sm text-slate-800 placeholder-slate-400 focus:not-[]: "
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="h-8 w-8 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-full flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ─── Panel Lateral Derecho Minimalista ─────────────────────────────── */}
      <div className="w-[280px] shrink-0  overflow-y-auto flex flex-col hidden xl:flex">

        {/* Avatar grande + nombre */}
        <div className="flex flex-col items-center pt-10 pb-8 px-5 border-b border-slate-100">
          <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-3xl mb-4">
            {initials}
          </div>
          <h2 className="text-lg font-bold text-slate-900 text-center">{chat.name}</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{chat.phone}</p>
        </div>


        {/* Detalles Limpios */}
        <div className="flex-1 p-6 space-y-8">
          
          {/* Fila: Estado */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-2">ESTADO DEL CHAT</p>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
              {convStatus === 'Pendiente' ? <Clock className="h-4 w-4 text-slate-400" /> : convStatus === 'Cerrado' ? <Archive className="h-4 w-4 text-slate-400" /> : <PlayCircle className="h-4 w-4 text-emerald-500" />}
              {convStatus}
            </div>
          </div>

          {/* Fila: Modo */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-2">ATENCIÓN ACTUAL</p>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
              {isBotActive ? <Bot className="h-4 w-4 text-slate-400" /> : <UserCheck className="h-4 w-4 text-slate-400" />}
              {isBotActive ? 'Inteligencia Artificial' : 'Asesor Humano'}
            </div>
          </div>

          {/* Fila: Etiquetas */}
          {chat.labels && chat.labels.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 mb-2">ETIQUETAS</p>
              <div className="flex flex-wrap gap-2">
                {chat.labels.map((label, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 font-medium text-xs rounded-md">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fila: Conteo */}
          <div>
            <p className="text-[11px] font-semibold text-slate-400 mb-2">INTERACCIONES</p>
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-800">
              <FileText className="h-4 w-4 text-slate-400" />
              {chat.messages?.length || 0} mensajes
            </div>
          </div>
        </div>

        {/* Botones de Acción Limpios */}
        <div className="p-6 space-y-3">
          
          {/* Formulario/Botón de Convertir a Lead */}
          {!isLeadFormOpen ? (
            <button
              onClick={() => setIsLeadFormOpen(true)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all mb-2"
            >
              <TrendingUp className="h-4 w-4" /> Convertir en Prospecto
            </button>
          ) : (
            <form onSubmit={handleConvertToLead} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mb-3">
              <p className="text-[10px] font-extrabold uppercase text-slate-700 tracking-widest">Registrar Préstamo</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  placeholder="Monto (ej: 2000)"
                  value={leadForm.monto}
                  onChange={(e) => setLeadForm({ ...leadForm, monto: e.target.value })}
                  min="0"
                  className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
                  required
                />
              </div>
              <select
                value={leadForm.stage}
                onChange={(e) => setLeadForm({ ...leadForm, stage: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
              >
                <option value="Nuevo">Nuevo</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Prestamo Programado">Préstamo Programado</option>
                <option value="Prestamo Cerrado">Préstamo Cerrado</option>
              </select>
              <input
                type="text"
                placeholder="Nota (ej: capital de trabajo)"
                value={leadForm.reason}
                onChange={(e) => setLeadForm({ ...leadForm, reason: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-700"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsLeadFormOpen(false)} className="flex-1 py-1.5 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Guardar</button>
              </div>
            </form>
          )}

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5  text-white bg-red-600 rounded-lg font-medium text-sm transition-colors"
          >
            <Trash2 className="h-4 w-4" /> Eliminar conversación
          </button>

          <button className="w-full flex items-center justify-center gap-2 py-2.5  text-white bg-slate-900  rounded-lg font-medium text-sm transition-colors">
            <Ban className="h-4 w-4" /> Bloquear contacto
          </button>
        </div>
      </div>

      {/* ─── Modal Confirmar Eliminación ─────────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-black text-slate-800">Eliminar conversación</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-4 font-medium">
              Por favor, indica la razón por la que estás eliminando esta conversación con <span className="font-bold text-slate-700">{chat.name}</span>. Esta acción no se puede deshacer.
            </p>

            <form onSubmit={handleDeleteSubmit} className="space-y-4">
              <textarea
                autoFocus
                rows="3"
                placeholder="Escribe la razón aquí..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-700 font-medium resize-none"
                required
              />
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!deleteReason.trim()}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  Eliminar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
