import React, { useState } from 'react';
import { Search, PlusSquare, SlidersHorizontal, MessageCircle } from 'lucide-react';

export default function ChatList({ chats, activeChatId, setActiveChatId, searchQuery, setSearchQuery }) {
  const [activeFilter, setActiveFilter] = useState('todos');

  // Filter and search chats
  const filteredChats = chats.filter(chat => {
    const matchesSearch = 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'unread') {
      return chat.unreadCount > 0;
    }
    if (activeFilter === 'ia') {
      return chat.status === 'IA';
    }
    if (activeFilter === 'humano') {
      return chat.status === 'Humano';
    }
    return true;
  });

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return (
    <div className="w-[340px] border-r border-slate-100 bg-white flex flex-col h-full shrink-0 select-none">
      {/* Chats Header */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight font-outfit">Chats</h1>
            {totalUnread > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center animate-pulse">
                {totalUnread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => alert("Nuevo chat...")}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Nuevo Chat"
            >
              <PlusSquare className="h-5 w-5" />
            </button>
            <button 
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              title="Filtros"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre o mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:border-slate-200 focus:outline-none rounded-xl transition-all duration-200"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'unread', label: 'No leídos' },
            { id: 'ia', label: 'Agente IA' },
            { id: 'humano', label: 'Humano' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors duration-150 ${
                activeFilter === filter.id 
                  ? 'bg-slate-800 text-white' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredChats.length > 0 ? (
          filteredChats.map(chat => {
            const isSelected = activeChatId === chat.id;
            return (
              <div
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`flex items-center gap-3 p-3 mx-1.5 my-0.5 rounded-2xl cursor-pointer select-none transition-all duration-200 ${
                  isSelected 
                    ? 'bg-emerald-50/60 border-l-[3px] border-emerald-500 pl-2.5 shadow-sm shadow-emerald-50/50' 
                    : 'hover:bg-slate-50/80 border-l-[3px] border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                  chat.status === 'IA' 
                    ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {chat.avatar}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-bold text-slate-800 truncate">{chat.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{chat.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
                      {chat.lastMessage}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                      {/* IA / Humano Status Pill */}
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                        chat.status === 'IA' 
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100/50'
                      }`}>
                        {chat.status}
                      </span>
                      {/* Unread badge */}
                      {chat.unreadCount > 0 && (
                        <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shadow-sm shadow-emerald-500/20">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-32 flex flex-col items-center justify-center text-center p-5">
            <span className="text-sm font-semibold text-slate-400">No se encontraron chats</span>
            <span className="text-xs text-slate-400 mt-1">Intenta con otra búsqueda o filtro</span>
          </div>
        )}
      </div>
    </div>
  );
}
