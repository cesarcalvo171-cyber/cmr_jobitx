import React, { useState } from 'react';
import { Search, Bot, UserCheck } from 'lucide-react';
import { useCRMStore } from '../store/crmStore';

export default function ChatList({ chats = [], activeChatId, onSelectChat, searchQuery, onSearchChange }) {
  const [activeFilter, setActiveFilter] = useState('todos');

  // Filtrar por texto y por estado de conversación
  const filteredChats = chats.filter(chat => {
    const safeName = chat.name || 'Contacto Sin Nombre';
    const matchesSearch = safeName.toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                          (chat.phone && chat.phone.includes(searchQuery));
    if (!matchesSearch) return false;

    if (activeFilter === 'ejecucion') return chat.convStatus === 'En Ejecución' || chat.rawConvStatus === 'active';
    if (activeFilter === 'pendientes') return chat.convStatus === 'Pendiente' || chat.rawConvStatus === 'snoozed';
    if (activeFilter === 'cerrados') return chat.convStatus === 'Cerrado' || chat.rawConvStatus === 'archived';
    if (activeFilter === 'bot') return chat.status === 'IA';
    return true;
  });

  return (
    <div className="w-[320px] flex flex-col h-full shrink-0 select-none bg-white border-r border-slate-200 z-10 relative">
      
      {/* Search Header */}
      <div className="px-5 pt-6 pb-2 border-b border-slate-100">
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar chats o números..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-300 focus:ring-0 focus:outline-none text-slate-700 placeholder-slate-400 font-medium transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar border-b border-slate-100">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              activeFilter === 'todos' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Todos ({chats.length})
          </button>
          <button
            onClick={() => setActiveFilter('ejecucion')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              activeFilter === 'ejecucion' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Activos
          </button>
          <button
            onClick={() => setActiveFilter('pendientes')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 shrink-0 ${
              activeFilter === 'pendientes' ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Espera
          </button>
        </div>
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => {
          const isSelected = activeChatId === chat.id;
          const isBot = chat.status === 'IA';
          const convStatus = chat.convStatus || 'En Ejecución';
          const isActive = convStatus === 'En Ejecución' || convStatus === 'active';

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-slate-50 relative ${
                isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'
              }`}
            >
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
              
              <div className="relative">
                <div className="h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-slate-100 text-slate-700">
                  {chat.name ? chat.name.substring(0, 2).toUpperCase() : '??'}
                </div>
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-blue-600 text-white border-2 border-white">
                    {chat.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className={`text-sm truncate ${isSelected ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{chat.name}</h4>
                  <span className={`text-[10px] ${chat.unreadCount > 0 ? 'font-bold text-blue-600' : 'font-medium text-slate-400'}`}>{chat.timestamp}</span>
                </div>
                
                <p className={`text-xs truncate mb-2 ${isSelected || chat.unreadCount > 0 ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                  {chat.lastMessage}
                </p>

                {/* Minimal Badges */}
                <div className="flex items-center gap-3">
                  {/* Status Dot */}
                  <div className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}></span>
                    <span className="text-[10px] font-medium text-slate-500">{convStatus}</span>
                  </div>

                  {/* Mode */}
                  <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                    {isBot ? <Bot className="h-3 w-3 text-slate-400" /> : <UserCheck className="h-3 w-3 text-slate-400" />}
                    <span>{isBot ? 'Bot' : 'Agente'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="text-center py-12 px-4 text-slate-400 text-xs">
            No se encontraron conversaciones.
          </div>
        )}
      </div>
    </div>
  );
}
