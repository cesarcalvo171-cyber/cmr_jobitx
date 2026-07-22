import React, { useState } from 'react';
import { Search, Bot, UserCheck } from 'lucide-react';
import { useCRMStore } from '../store/crmStore';

export default function ChatList({ chats = [], activeChatId, setActiveChatId, searchQuery, setSearchQuery }) {
  const [activeFilter, setActiveFilter] = useState('todos');

  // Filtrar por texto y por estado de conversación
  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
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
      <div className="px-5 pt-6 pb-4 border-b border-slate-100">
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar chats o números..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100/80 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700 placeholder-slate-400 font-semibold"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all shrink-0 ${
              activeFilter === 'todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Todos ({chats.length})
          </button>
          <button
            onClick={() => setActiveFilter('ejecucion')}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all shrink-0 ${
              activeFilter === 'ejecucion' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Ejecución
          </button>
          <button
            onClick={() => setActiveFilter('pendientes')}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all shrink-0 ${
              activeFilter === 'pendientes' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveFilter('cerrados')}
            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all shrink-0 ${
              activeFilter === 'cerrados' ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cerrados
          </button>
        </div>
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map(chat => {
          const isSelected = activeChatId === chat.id;
          const isBot = chat.status === 'IA';
          const convStatus = chat.convStatus || 'En Ejecución';

          return (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-all border-b border-slate-50 relative ${
                isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
              }`}
            >
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 rounded-r-full"></div>}
              
              <div className="relative">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden text-white shadow-xs ${
                  isBot ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}>
                  {chat.name ? chat.name.substring(0, 2).toUpperCase() : '??'}
                </div>
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white shadow-xs">
                    {chat.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-extrabold text-slate-800 truncate">{chat.name}</h4>
                  <span className="text-[9px] font-semibold text-slate-400">{chat.timestamp}</span>
                </div>
                
                <p className={`text-xs truncate mb-2 ${isSelected ? 'text-slate-700 font-semibold' : 'text-slate-500 font-medium'}`}>
                  {chat.lastMessage}
                </p>

                {/* Badges de Estado */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Badge Estado Conversación */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                    convStatus === 'En Ejecución' || convStatus === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : convStatus === 'Pendiente' || convStatus === 'snoozed'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {convStatus}
                  </span>

                  {/* Badge Modo Bot */}
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 ${
                    isBot ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {isBot ? <Bot className="h-2.5 w-2.5" /> : <UserCheck className="h-2.5 w-2.5" />}
                    {isBot ? 'IA' : 'Humano'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredChats.length === 0 && (
          <div className="text-center py-12 px-4 text-slate-400 font-medium text-xs">
            No se encontraron conversaciones con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
