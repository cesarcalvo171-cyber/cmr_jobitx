import React, { useState } from 'react';
import { X, Search, Plus, Send } from 'lucide-react';
import { useCRMStore } from '../store/crmStore';

export default function NewChatModal({ isOpen, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+52');
  const addClient = useCRMStore(state => state.addClient);
  const setActiveTab = useCRMStore(state => state.setActiveTab);
  const chats = useCRMStore(state => state.chats);
  const setActiveChatId = useCRMStore(state => state.setActiveChatId);

  if (!isOpen) return null;

  const handleStartChat = async () => {
    if (!phoneNumber) return;
    const fullPhone = `${countryCode}${phoneNumber}`;
    // Creamos cliente y conversacion automaticamente
    await addClient({
      name: `Nuevo Contacto ${fullPhone}`,
      phone: fullPhone,
      status: 'Nuevo'
    });
    
    // Cerramos el modal y vamos a la vista de chats
    onClose();
    setActiveTab('chats');
  };

  const handleSelectRecentContact = async (chatId) => {
    await setActiveChatId(chatId);
    onClose();
    setActiveTab('chats');
  };

  // Filtrar los primeros 4 contactos reales de la base de datos que ya tienen chats activos
  const recientesReales = chats.slice(0, 4).map(chat => ({
    id: chat.id,
    name: chat.name,
    avatar: chat.avatar,
    phone: chat.phone
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col font-sans relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-8 pt-8 pb-4 relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Iniciar Nuevo Chat</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">Conéctate con tus clientes al instante</p>
        </div>

        {/* Content */}
        <div className="px-8 py-2">
          {/* Buscar Contacto */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              BUSCAR CONTACTO
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Nombre, correo o número de teléfono..." 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-700 font-medium"
              />
            </div>
          </div>

          {/* Contactos Recientes Reales */}
          {recientesReales.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  CONTACTOS ACTIVOS RECIENTES
                </label>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                {recientesReales.map(contact => (
                  <div 
                    key={contact.id} 
                    onClick={() => handleSelectRecentContact(contact.id)}
                    className="flex flex-col items-center gap-2 cursor-pointer group text-center"
                  >
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-slate-100 overflow-hidden transition-transform group-hover:scale-105">
                        <img 
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} 
                          alt={contact.name} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate w-full px-1">{contact.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* O Bien Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-100 flex-1"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">O BIEN</span>
            <div className="h-px bg-slate-100 flex-1"></div>
          </div>

          {/* Manual Entry */}
          <div className="mb-6">
            <label className="text-[11px] font-bold text-green-600 uppercase tracking-wider flex items-center gap-1 mb-3">
              <div className="bg-green-100 rounded-full p-0.5"><Plus className="h-3 w-3" /></div> ENTRADA MANUAL
            </label>
            <div className="flex gap-3">
              <div className="relative w-24">
                <select 
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="+52">+52</option>
                  <option value="+34">+34</option>
                  <option value="+1">+1</option>
                  <option value="+505">+505</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
              <input 
                type="text" 
                placeholder="Número de WhatsApp" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter') handleStartChat(); }}
                className="flex-1 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 pt-4 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3.5 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 rounded-xl font-bold text-sm transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleStartChat}
            disabled={!phoneNumber}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 bg-[#059669] hover:bg-[#047857] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md shadow-green-600/20 transition-colors"
          >
            Comenzar Chat <Send className="h-4 w-4 ml-1" />
          </button>
        </div>
        
      </div>
    </div>
  );
}
