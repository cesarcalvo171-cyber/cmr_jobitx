import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Paperclip, Smile, Phone, Video, MoreVertical, 
  CheckCheck, Image as ImageIcon, TrendingUp, Ban, MessageSquare
} from 'lucide-react';

export default function ChatWindow({ chat, onSendMessage }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 select-none">
        <div className="h-20 w-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-slate-300">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Selecciona una conversación</h2>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(chat.id, inputText);
    setInputText('');
  };

  return (
    <div className="flex-1 flex h-full min-w-0 bg-white">
      
      {/* Central Chat Stream */}
      <div className="flex-1 flex flex-col h-full min-w-0 border-r border-slate-200">
        
        {/* Chat Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-100">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} alt="avatar" className="h-full w-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{chat.name}</h3>
              <p className="text-[10px] font-bold text-green-500 flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Escribiendo...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button className="hover:text-slate-700 transition-colors"><Phone className="h-5 w-5" /></button>
            <button className="hover:text-slate-700 transition-colors"><Video className="h-5 w-5" /></button>
            <button className="hover:text-slate-700 transition-colors"><MoreVertical className="h-5 w-5" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          <div className="flex justify-center">
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">Hoy</span>
          </div>

          <div className="flex justify-start message-bubble">
            <div className="max-w-[70%]">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-900 text-sm leading-relaxed rounded-tl-sm shadow-sm border border-indigo-100/50">
                Hola, buenos días. Estaba viendo el catálogo de soluciones empresariales y me interesó el plan Premium.
              </div>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 text-right">09:15</p>
            </div>
          </div>

          <div className="flex justify-center my-2">
            <span className="text-[10px] font-semibold text-slate-400 italic">ChatBot asignó esta conversación a Manager</span>
          </div>

          <div className="flex justify-end message-bubble">
            <div className="max-w-[70%] flex flex-col items-end">
              <div className="p-4 rounded-2xl bg-green-500 text-white text-sm leading-relaxed rounded-tr-sm shadow-sm">
                ¡Hola {chat.name.split(' ')[0]}! Un gusto saludarte. Con gusto puedo apoyarte con esa información. ¿Para cuántos usuarios estarías necesitando la licencia?
              </div>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-[10px] font-semibold text-slate-400">09:17</p>
                <CheckCheck className="h-3 w-3 text-green-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-start message-bubble">
            <div className="max-w-[70%]">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-900 text-sm leading-relaxed rounded-tl-sm shadow-sm border border-indigo-100/50">
                Sería para un equipo de 25 personas inicialmente. ¿Tienen algún descuento por volumen o pago anual?
              </div>
              <p className="text-[10px] font-semibold text-slate-400 mt-1 text-right">09:20</p>
            </div>
          </div>

          {/* Dinámico */}
          {chat.messages?.map((msg, index) => {
            const isClient = msg.sender === 'client';
            return (
              <div key={index} className={`flex ${isClient ? 'justify-start' : 'justify-end'} message-bubble`}>
                <div className={`max-w-[70%] flex flex-col ${isClient ? 'items-start' : 'items-end'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isClient 
                      ? 'bg-indigo-50 text-indigo-900 rounded-tl-sm border border-indigo-100/50' 
                      : 'bg-green-500 text-white rounded-tr-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-[10px] font-semibold text-slate-400">{msg.time}</p>
                    {!isClient && <CheckCheck className="h-3 w-3 text-slate-300" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-1">
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600"><Smile className="h-5 w-5" /></button>
              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent border-none py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-green-500/20"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </div>
            <div className="flex items-center gap-4 px-4 text-xs font-semibold text-slate-500">
              <button type="button" className="flex items-center gap-1.5 hover:text-slate-700">
                <Paperclip className="h-3.5 w-3.5" /> Adjuntar archivo
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-slate-700">
                <ImageIcon className="h-3.5 w-3.5" /> Imagen
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Details Panel */}
      <div className="w-[300px] shrink-0 bg-white overflow-y-auto flex flex-col p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="h-24 w-24 rounded-full border-4 border-slate-50 overflow-hidden mb-4 shadow-sm bg-slate-100">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} alt="avatar" className="h-full w-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">{chat.name}</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex gap-1">
            Lead Score: <span className="text-green-600 font-bold">85/100</span>
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ETAPA DEL LEAD</p>
            <div className="w-full bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-2 justify-center text-green-700 font-bold text-sm">
              <TrendingUp className="h-4 w-4" /> Negociación
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">ETIQUETAS</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-[10px] rounded-full border border-teal-100">Empresa IT</span>
              <span className="px-3 py-1 bg-orange-50 text-orange-700 font-bold text-[10px] rounded-full border border-orange-100">Prospecto VIP</span>
              <button className="px-3 py-1 bg-slate-50 text-slate-500 font-bold text-[10px] rounded-full border border-dashed border-slate-300 hover:bg-slate-100">
                + Añadir
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOTAS</p>
              <button className="text-[10px] font-bold text-green-600">Editar</button>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 italic leading-relaxed">
              "Interesada en plan Premium para 25 personas. Mencionar descuento por pago anual. Seguimiento urgente."
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8">
          <button className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors">
            <Ban className="h-4 w-4" /> Bloquear contacto
          </button>
        </div>
      </div>

    </div>
  );
}
