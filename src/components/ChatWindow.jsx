import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Phone, 
  Video, 
  MoreVertical, 
  Bot, 
  User, 
  Info, 
  CheckCheck,
  Play, 
  Volume2, 
  Sparkles,
  Plus,
  Trash
} from 'lucide-react';

export default function ChatWindow({ chat, onSendMessage, onToggleStatus }) {
  const [inputText, setInputText] = useState('');
  const [showDetails, setShowDetails] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    // Empty State matching screenshot perfectly
    return (
      <div className="flex-1 bg-slate-50/50 flex flex-col items-center justify-center select-none">
        <div className="flex flex-col items-center max-w-sm text-center">
          {/* Circular Speech Bubble Icon */}
          <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-100/80 mb-6">
            <svg 
              className="h-10 w-10 text-slate-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" 
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">Selecciona una conversación</h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            Elige un contacto para ver sus mensajes
          </p>

          {/* Keyboard Shortcuts Helper */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { key: 'Tab', action: 'navegar' },
              { key: 'Enter', action: 'abrir' },
              { key: 'Esc', action: 'volver' }
            ].map(shortcut => (
              <div key={shortcut.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/60 shadow-sm rounded-xl text-xs">
                <kbd className="font-bold font-mono text-slate-600 bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 rounded-md text-[10px]">
                  {shortcut.key}
                </kbd>
                <span className="text-slate-400 font-semibold">{shortcut.action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(chat.id, inputText);
    setInputText('');
  };

  const handleAddLabel = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    chat.labels = [...(chat.labels || []), newLabel.trim()];
    setNewLabel('');
  };

  const handleRemoveLabel = (labelToRemove) => {
    chat.labels = chat.labels.filter(l => l !== labelToRemove);
  };

  return (
    <div className="flex-1 bg-slate-50/30 flex h-full min-w-0 overflow-hidden">
      {/* Central Chat Stream */}
      <div className="flex-1 flex flex-col h-full bg-white min-w-0 border-r border-slate-100">
        
        {/* Chat Window Header */}
        <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
              chat.status === 'IA' 
                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              {chat.avatar}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 truncate">{chat.name}</span>
              <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                En línea • {chat.platform}
              </span>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-3">
            {/* Triage / AI Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/50 shadow-inner select-none">
              <button
                onClick={() => onToggleStatus(chat.id, 'IA')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  chat.status === 'IA' 
                    ? 'bg-white text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                <span>Agente IA</span>
              </button>
              <button
                onClick={() => onToggleStatus(chat.id, 'Humano')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                  chat.status === 'Humano' 
                    ? 'bg-white text-amber-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Humano</span>
              </button>
            </div>

            <div className="h-6 w-[1px] bg-slate-100"></div>

            {/* Actions */}
            <div className="flex items-center gap-1 text-slate-400">
              <button className="p-2 hover:bg-slate-50 rounded-lg hover:text-slate-600 transition-colors">
                <Phone className="h-4.5 w-4.5" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-lg hover:text-slate-600 transition-colors">
                <Video className="h-4.5 w-4.5" />
              </button>
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className={`p-2 rounded-lg transition-colors ${
                  showDetails ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50' : 'hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <Info className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40 space-y-4">
          {chat.messages.map((msg, index) => {
            const isClient = msg.sender === 'client';
            const isIA = msg.sender === 'ia';
            
            return (
              <div 
                key={msg.id || index} 
                className={`flex w-full ${isClient ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div className={`max-w-[70%] flex flex-col ${isClient ? 'items-start' : 'items-end'}`}>
                  
                  {/* Message Bubble */}
                  <div className={`p-3.5 rounded-2xl shadow-sm text-sm ${
                    isClient 
                      ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
                      : isIA
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none'
                  }`}>
                    {/* If Audio Message */}
                    {msg.isAudio ? (
                      <div className="flex items-center gap-3.5 py-1 min-w-[200px]">
                        <button className="h-9 w-9 rounded-full bg-emerald-50/20 text-white flex items-center justify-center hover:bg-emerald-50/30 transition-colors">
                          <Play className="h-4 w-4 fill-white" />
                        </button>
                        <div className="flex-1 flex flex-col gap-1.5">
                          {/* Audio waves helper */}
                          <div className="flex items-end gap-0.5 h-6">
                            {[2,5,3,6,4,7,5,8,3,6,4,7,5,8,3,5,2].map((height, i) => (
                              <div 
                                key={i} 
                                style={{ height: `${height * 10}%` }} 
                                className="flex-1 bg-white/40 rounded-full"
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-white/80">
                            <span className="font-semibold flex items-center gap-1">
                              <Volume2 className="h-3 w-3" />
                              Mensaje de voz
                            </span>
                            <span>{msg.duration}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    {/* IA Tag indicator */}
                    {isIA && (
                      <span className="flex items-center gap-0.5 text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider scale-90">
                        <Sparkles className="h-2.5 w-2.5" />
                        IA
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold">{msg.time}</span>
                    {!isClient && (
                      <CheckCheck className={`h-3.5 w-3.5 ${isIA ? 'text-indigo-400' : 'text-emerald-400'}`} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center gap-3 shrink-0 select-none">
          <div className="flex items-center gap-1 text-slate-400">
            <button type="button" className="p-2.5 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors">
              <Paperclip className="h-5 w-5" />
            </button>
            <button type="button" className="p-2.5 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors">
              <Smile className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={chat.status === 'IA' ? "El Agente IA está activo. Escribe algo para simular..." : "Escribe un mensaje aquí..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-50 focus:bg-white text-sm text-slate-800 border border-transparent focus:border-slate-200 focus:outline-none rounded-2xl transition-all duration-200"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>

          <button
            type="submit"
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all duration-150 shrink-0"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>

      {/* Side Inspector (Details Panel) */}
      {showDetails && (
        <div className="w-[280px] bg-white border-l border-slate-100 flex flex-col h-full shrink-0 select-none overflow-y-auto animate-slide-in">
          {/* Top profile view */}
          <div className="p-6 flex flex-col items-center text-center border-b border-slate-50">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl mb-4 shadow-inner">
              {chat.avatar}
            </div>
            <h3 className="font-bold text-slate-800 text-base">{chat.name}</h3>
            <span className="text-xs text-slate-400 mt-1 font-semibold">{chat.phone}</span>
          </div>

          {/* Details list */}
          <div className="p-5 border-b border-slate-50 space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalles de contacto</h4>
            
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Correo Electrónico</span>
                <span className="text-xs font-semibold text-slate-700 break-all">{chat.email || 'No registrado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Canal de Ingreso</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {chat.platform}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Atribución de Respuesta</span>
                <span className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded ${
                  chat.status === 'IA' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {chat.status === 'IA' ? 'Asignado a Agente IA' : 'Atención Manual'}
                </span>
              </div>
            </div>
          </div>

          {/* Labels Section */}
          <div className="p-5 border-b border-slate-50 space-y-3.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Etiquetas</h4>
            
            {/* Labels container */}
            <div className="flex flex-wrap gap-1.5">
              {chat.labels && chat.labels.map((label, idx) => (
                <span 
                  key={idx} 
                  className="flex items-center gap-1 text-[10px] font-bold bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200/50 hover:border-red-200 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                  onClick={() => handleRemoveLabel(label)}
                  title="Haz clic para eliminar"
                >
                  {label}
                  <Plus className="h-3 w-3 rotate-45 shrink-0" />
                </span>
              ))}
            </div>

            {/* Add Label Form */}
            <form onSubmit={handleAddLabel} className="flex gap-2">
              <input
                type="text"
                placeholder="Nueva etiqueta..."
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1 bg-slate-50 text-xs px-2.5 py-1.5 border border-transparent focus:border-slate-200 focus:outline-none rounded-lg"
              />
              <button 
                type="submit"
                className="p-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Action Tools */}
          <div className="p-5 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acciones rápidas</h4>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => alert(`Enviando plantilla de cobro a ${chat.name}...`)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl text-center border border-slate-100 transition-colors"
              >
                Cobro
              </button>
              <button 
                onClick={() => alert(`Enviando plantilla de bienvenida a ${chat.name}...`)}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl text-center border border-slate-100 transition-colors"
              >
                Bienvenida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
