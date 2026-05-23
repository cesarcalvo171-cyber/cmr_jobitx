import React, { useState } from 'react';
import { Search, Plus } from 'lucide-react';

export default function ChatList({ chats, activeChatId, setActiveChatId, searchQuery, setSearchQuery }) {
  const [activeFilter, setActiveFilter] = useState('asignados');

  return (
    <div className="w-[320px] flex flex-col h-full shrink-0 select-none bg-white border-r border-slate-200 z-10 relative">
      
      {/* Search Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar conversaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/70 border-none rounded-full focus:ring-2 focus:ring-green-500 focus:outline-none text-slate-700 placeholder-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('asignados')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
              activeFilter === 'asignados' ? 'bg-green-500 text-white shadow-sm shadow-green-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Asignados a mí
          </button>
          <button
            onClick={() => setActiveFilter('bot')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
              activeFilter === 'bot' ? 'bg-green-500 text-white shadow-sm shadow-green-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Bot
          </button>
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3 py-1.5 text-xs font-bold rounded-full transition-colors ${
              activeFilter === 'todos' ? 'bg-green-500 text-white shadow-sm shadow-green-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Chat Items */}
      <div className="flex-1 overflow-y-auto">
        {chats.map(chat => {
          const isSelected = activeChatId === chat.id;
          return (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`flex items-start gap-3 p-4 cursor-pointer transition-colors border-b border-slate-50 relative ${
                isSelected ? 'bg-slate-50' : 'hover:bg-slate-50'
              }`}
            >
              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>}
              
              <div className="relative">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ${
                  chat.status === 'IA' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.name}`} alt="avatar" className="h-full w-full object-cover" />
                </div>
                {chat.unreadCount > 0 && (
                  <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{chat.timestamp}</span>
                </div>
                <p className={`text-xs truncate ${isSelected ? 'text-slate-700 font-medium' : 'text-slate-500'}`}>
                  {chat.lastMessage}
                </p>
                {/* Example Badge */}
                {isSelected && (
                  <div className="mt-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-teal-50 text-teal-600 rounded-md border border-teal-100">VIP</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
