import React, { useState } from 'react';
import { Search, Phone, Mail, X, ArrowLeft } from 'lucide-react';

export default function Clientes({ clients }) {
  const [selectedContactId, setSelectedContactId] = useState(clients.length > 0 ? clients[0].id : null);
  const [search, setSearch] = useState('');
  const [showDetailsOnMobile, setShowDetailsOnMobile] = useState(false);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const activeContact = clients.find(c => c.id === selectedContactId) || clients[0];

  const getTagColor = (status) => {
    switch (status) {
      case 'Cerrado - Ganado': return 'text-teal-600 bg-teal-50';
      case 'Demo Programada': return 'text-orange-600 bg-orange-50';
      default: return 'text-indigo-600 bg-indigo-50';
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    setShowDetailsOnMobile(true);
  };

  return (
    <div className="flex-1 overflow-hidden p-4 md:p-8 bg-slate-50/50 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight font-outfit">Directorio de Contactos</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">{clients.length} contactos totales</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 relative">
        {/* Left List */}
        <div className={`flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden ${showDetailsOnMobile ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white shadow-sm z-10">
                <tr className="text-[10px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                  <th className="py-4 px-4 md:px-6">CONTACTO</th>
                  <th className="py-4 px-4 md:px-6 hidden sm:table-cell">TELÉFONO</th>
                  <th className="py-4 px-4 md:px-6 hidden lg:table-cell">ETIQUETAS</th>
                  <th className="py-4 px-4 md:px-6 hidden md:table-cell">REGISTRO</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => handleSelectContact(contact.id)}
                    className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedContactId === contact.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="py-4 px-4 md:px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${contact.name}`} alt="avatar" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{contact.name}</p>
                          <p className="text-xs text-slate-500 font-medium truncate">{contact.email}</p>
                          <p className="text-xs text-slate-400 sm:hidden mt-0.5">{contact.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 font-semibold text-slate-700 hidden sm:table-cell">
                      {contact.phone}
                    </td>
                    <td className="py-4 px-4 md:px-6 hidden lg:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTagColor(contact.status)}`}>
                          {contact.status}
                        </span>
                        {contact.labels && contact.labels.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 md:px-6 font-semibold text-slate-700 hidden md:table-cell">
                      {contact.creationDate}
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr><td colSpan="4" className="text-center py-8 text-slate-500">No hay contactos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details Card */}
        {activeContact && (
          <div className={`w-full md:w-[320px] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col shrink-0 overflow-hidden relative ${showDetailsOnMobile ? 'flex' : 'hidden md:flex'}`}>
            <div className="h-24 md:h-32 bg-gradient-to-r from-green-500 to-emerald-600 shrink-0 relative">
              <button 
                onClick={() => setShowDetailsOnMobile(false)}
                className="md:hidden absolute top-4 left-4 p-1.5 rounded-full bg-black/20 text-white hover:bg-black/30 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            
            <div className="px-6 pb-6 flex-1 overflow-y-auto relative">
              <div className="absolute -top-12 left-6 h-20 w-20 rounded-2xl border-4 border-white bg-slate-200 overflow-hidden shadow-md z-10">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeContact.name}`} alt="avatar" className="h-full w-full object-cover bg-white" />
              </div>

              <div className="mt-16">
                <h2 className="text-xl font-bold text-slate-800">{activeContact.name}</h2>
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{activeContact.status}</span>
              </div>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="font-medium">{activeContact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="font-medium truncate">{activeContact.email}</span>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">ETIQUETAS DEL CRM</p>
                <div className="flex flex-wrap gap-2">
                  {activeContact.labels && activeContact.labels.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-bold flex items-center gap-1 border border-teal-100">
                      <span className="text-teal-400">🏷</span> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Notas</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 italic">
                  {activeContact.notes}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
