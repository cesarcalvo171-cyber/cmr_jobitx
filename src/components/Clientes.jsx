import React, { useState } from 'react';
import {
  Search,
  Phone,
  Mail,
  ArrowLeft,
  Calendar,
  User2,
} from 'lucide-react';

export default function Clientes({ clients }) {
  const [selectedContactId, setSelectedContactId] = useState(
    clients.length > 0 ? clients[0].id : null
  );

  const [search, setSearch] = useState('');
  const [showDetailsOnMobile, setShowDetailsOnMobile] = useState(false);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const activeContact =
    clients.find((c) => c.id === selectedContactId) || clients[0];

  const getTagColor = (status) => {
    switch (status) {
      case 'Cerrado - Ganado':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';

      case 'Demo Programada':
        return 'text-orange-700 bg-orange-50 border-orange-100';

      case 'Nuevo':
        return 'text-blue-700 bg-blue-50 border-blue-100';

      default:
        return 'text-indigo-700 bg-indigo-50 border-indigo-100';
    }
  };

  const handleSelectContact = (id) => {
    setSelectedContactId(id);
    setShowDetailsOnMobile(true);
  };

  return (
    <div className="flex-1 overflow-hidden bg-slate-50 p-4 md:p-8 flex flex-col h-full">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6 shrink-0">

        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Directorio de Contactos
          </h1>

          <p className="text-sm text-slate-500 mt-1 font-medium">
            {clients.length} contactos registrados
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

          <input
            type="text"
            placeholder="Buscar contacto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex gap-6 min-h-0">

        {/* LEFT TABLE */}
        <div
          className={`flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden ${
            showDetailsOnMobile ? 'hidden md:flex' : 'flex'
          } flex-col`}
        >

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">

              <thead className="sticky top-0 z-20 bg-white border-b border-slate-100">
                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400">

                  <th className="px-6 py-5 font-bold">Contacto</th>

                  <th className="px-6 py-5 font-bold hidden sm:table-cell">
                    Teléfono
                  </th>

                  <th className="px-6 py-5 font-bold hidden xl:table-cell">
                    Etiquetas
                  </th>

                  <th className="px-6 py-5 font-bold hidden lg:table-cell">
                    Registro
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => handleSelectContact(contact.id)}
                    className={`cursor-pointer transition-all border-b border-slate-100 hover:bg-slate-50 ${
                      selectedContactId === contact.id
                        ? 'bg-emerald-50/40'
                        : ''
                    }`}
                  >

                    {/* CONTACTO */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">

                        {/* AVATAR INITIALS */}
                        <div className="h-12 w-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}&backgroundColor=e2e8f0&fontSize=40&fontWeight=700`}
                            alt={contact.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* INFO */}
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 truncate">
                            {contact.name}
                          </h3>

                          <p className="text-sm text-slate-500 truncate">
                            {contact.email}
                          </p>

                          <p className="text-xs text-slate-400 sm:hidden mt-1">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <span className="font-semibold text-slate-700">
                        {contact.phone}
                      </span>
                    </td>

                    {/* TAGS */}
                    <td className="px-6 py-5 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-2">

                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getTagColor(
                            contact.status
                          )}`}
                        >
                          {contact.status}
                        </span>

                        {contact.labels &&
                          contact.labels.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-5 hidden lg:table-cell">
                      <span className="font-semibold text-slate-600">
                        {contact.creationDate}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredClients.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-16 text-slate-500"
                    >
                      No hay contactos encontrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT PANEL */}
        {activeContact && (
          <div
            className={`w-full md:w-[360px] bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden shrink-0 flex-col ${
              showDetailsOnMobile ? 'flex' : 'hidden md:flex'
            }`}
          >

            {/* TOP BANNER */}
            <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 px-6 pt-5 pb-6 flex items-end gap-5">

              {/* BACK */}
              <button
                onClick={() => setShowDetailsOnMobile(false)}
                className="md:hidden absolute top-4 left-4 z-30 h-9 w-9 rounded-full bg-black/20 text-white flex items-center justify-center backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {/* AVATAR */}
              <div className="h-20 w-20 rounded-3xl overflow-hidden border-4 border-white/80 shadow-xl bg-white shrink-0 mt-8">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${activeContact.name}&backgroundColor=e2e8f0&fontSize=42&fontWeight=700`}
                  alt={activeContact.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* NAME inline with avatar */}
              <div className="pb-1 min-w-0">
                <h2 className="text-xl font-black text-white leading-tight truncate">
                  {activeContact.name}
                </h2>
                <span
                  className={`inline-flex mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] bg-white/20 text-white border border-white/30`}
                >
                  {activeContact.status}
                </span>
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">

              {/* CONTACT INFO */}
              <div className="mt-2 space-y-5">

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Teléfono
                    </p>

                    <p className="font-semibold text-slate-700">
                      {activeContact.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Email
                    </p>

                    <p className="font-semibold text-slate-700 truncate">
                      {activeContact.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Registro
                    </p>

                    <p className="font-semibold text-slate-700">
                      {activeContact.creationDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* TAGS */}
              <div className="mt-10 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Etiquetas del CRM
                </p>

                <div className="flex flex-wrap gap-2">
                  {activeContact.labels &&
                    activeContact.labels.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold flex items-center gap-1"
                      >
                        🏷 {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* NOTES */}
              <div className="mt-10 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Notas
                </p>

                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    {activeContact.notes}
                  </p>
                </div>
              </div>

              {/* RESPONSABLE */}
              <div className="mt-10 border-t border-slate-100 pt-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                  Responsable
                </p>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <User2 className="h-4 w-4 text-slate-500" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700">
                      Equipo Comercial
                    </p>

                    <p className="text-xs text-slate-400">
                      Gestionado vía TalosFlow
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}