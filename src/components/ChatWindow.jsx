import { useState, useRef, useEffect } from 'react';
import {
  Send, Smile, MessageSquare,
  CheckCheck, Bot, UserCheck, Tag, FileText, Ban, Info,
  PlayCircle, Clock, Archive
} from 'lucide-react';
import { useCRMStore } from '../store/crmStore';

export default function ChatWindow({ chat, onSendMessage, onToggleStatus }) {
  const { updateConversationStatus } = useCRMStore();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

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

  return (
    <div className="flex-1 flex h-full min-w-0 bg-white">

      {/* ─── Área de Chat ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-slate-100">

        {/* Cabecera del Chat con Controles de Admin */}
        <div className="h-[72px] px-6 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-800 text-sm truncate">{chat.name}</h3>
              <p className="text-xs font-semibold text-slate-400 truncate">{chat.phone}</p>
            </div>
          </div>

          {/* Barra de Controles de Admin */}
          <div className="flex items-center gap-3">
            
            {/* Selector de Estado de la Conversación */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 pl-2 hidden sm:inline">Estado:</span>
              <select
                value={convStatus}
                onChange={(e) => handleConvStatusChange(e.target.value)}
                className="bg-white text-xs font-bold text-slate-700 py-1 px-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="En Ejecución">🟢 En Ejecución</option>
                <option value="Pendiente">🟡 Pendiente</option>
                <option value="Cerrado">🔴 Cerrado</option>
              </select>
            </div>

            {/* Botón Toggle IA / Humano */}
            <button
              onClick={handleToggle}
              title={isBotActive ? 'La IA está respondiendo automáticamente. Clic para pasar a control Humano.' : 'Estás respondiendo manualmente. Clic para reactivar la IA.'}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all duration-200 shrink-0 shadow-2xs ${
                isBotActive
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isBotActive ? (
                <><Bot className="h-3.5 w-3.5" /> Bot IA Activo</>
              ) : (
                <><UserCheck className="h-3.5 w-3.5" /> Modo Humano</>
              )}
            </button>

          </div>
        </div>

        {/* ─── Mensajes ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-slate-50/40">

          {/* Sin mensajes */}
          {(!chat.messages || chat.messages.length === 0) && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <MessageSquare className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Aún no hay mensajes en esta conversación.</p>
              <p className="text-[10px] font-medium text-slate-400">Los mensajes entrantes o salientes de WhatsApp aparecerán aquí en vivo.</p>
            </div>
          )}

          {/* Lista de mensajes recibidos/enviados */}
          {chat.messages?.map((msg) => {
            const isClient = msg.sender === 'client';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] flex flex-col ${isClient ? 'items-start' : 'items-end'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs font-medium ${
                    isClient
                      ? 'bg-white text-slate-800 rounded-tl-xs border border-slate-200'
                      : msg.sender === 'ia'
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-emerald-600 text-white rounded-tr-xs'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[9px] font-bold text-slate-400">
                      {msg.sender === 'ia' ? 'Bot IA' : msg.sender === 'client' ? 'Cliente' : 'Admin'} • {msg.time}
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

          {/* Aviso contextual */}
          {isBotActive && (
            <div className="mb-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs font-semibold text-indigo-700">
              <span className="flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5 text-indigo-500" />
                El Bot de IA está activo respondiendo mensajes.
              </span>
              <button 
                onClick={handleToggle}
                className="text-[10px] font-extrabold underline hover:text-indigo-900"
              >
                Tomar control manual
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 shrink-0">
              <Smile className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder={isBotActive ? 'Escribe para responder manualmente (tomando el control)...' : 'Escribe un mensaje de WhatsApp...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent border-none py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="h-9 w-9 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-sm shrink-0"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ─── Panel Lateral Derecho (Detalles del Contacto) ─────────────────── */}
      <div className="w-[280px] shrink-0 bg-slate-50/50 overflow-y-auto flex flex-col border-l border-slate-100 hidden xl:flex">

        {/* Avatar grande + nombre */}
        <div className="flex flex-col items-center pt-8 pb-6 px-5 border-b border-slate-100 bg-white">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-2xl shadow-md mb-3">
            {initials}
          </div>
          <h2 className="text-base font-black text-slate-800 text-center">{chat.name}</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">{chat.phone}</p>
        </div>

        {/* Detalles */}
        <div className="flex-1 p-5 space-y-6">

          {/* Estado de la Conversación */}
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Info className="h-3 w-3" /> Estado del Chat
            </p>
            <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              convStatus === 'En Ejecución' || convStatus === 'active'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : convStatus === 'Pendiente' || convStatus === 'snoozed'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {convStatus === 'Pendiente' ? <Clock className="h-4 w-4" /> : convStatus === 'Cerrado' ? <Archive className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              {convStatus}
            </div>
          </div>

          {/* Modo de Atención */}
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Bot className="h-3 w-3" /> Modo de Atención
            </p>
            <div className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              isBotActive
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isBotActive ? <Bot className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {isBotActive ? 'Bot IA respondiendo' : 'Asesor Humano a cargo'}
            </div>
          </div>

          {/* Etiquetas */}
          {chat.labels && chat.labels.length > 0 && (
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Etiquetas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {chat.labels.map((label, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white text-slate-600 font-bold text-[9px] rounded-full border border-slate-200">
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Conteo de Mensajes */}
          <div>
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <FileText className="h-3 w-3" /> Total Mensajes
            </p>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 font-bold text-center">
              {chat.messages?.length || 0} mensaje{chat.messages?.length !== 1 ? 's' : ''} registrados
            </div>
          </div>
        </div>

        {/* Botón Bloquear */}
        <div className="p-5 border-t border-slate-100 bg-white">
          <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl font-bold text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
            <Ban className="h-3.5 w-3.5" /> Bloquear contacto
          </button>
        </div>
      </div>

    </div>
  );
}
