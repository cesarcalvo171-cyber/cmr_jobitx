import React, { useState } from 'react';
import { Plus, Search, UserPlus, SlidersHorizontal, Mail, Phone, Calendar, Tag, Trash } from 'lucide-react';

export default function Clientes({ clients, onAddClient, onDeleteClient }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('Nuevo');
  const [labels, setLabels] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const newClient = {
      id: Date.now(),
      name,
      phone,
      email,
      status,
      creationDate: new Date().toISOString().split('T')[0],
      labels: labels.split(',').map(l => l.trim()).filter(Boolean),
      notes
    };

    onAddClient(newClient);
    
    // Clear form
    setName('');
    setPhone('');
    setEmail('');
    setStatus('Nuevo');
    setLabels('');
    setNotes('');
    setShowAddModal(false);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.email.toLowerCase().includes(search.toLowerCase()) ||
                          c.phone.includes(search);
    
    const matchesFilter = filterStatus === 'todos' || c.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 bg-slate-50/50 flex flex-col h-full overflow-hidden select-none p-8">
      {/* Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-outfit">Clientes</h1>
          <p className="text-sm text-slate-400 font-semibold mt-0.5">Gestiona y califica a tus prospectos en la base de datos.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-150"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Añadir Cliente</span>
        </button>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 mb-6 shadow-sm">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, correo o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 border border-transparent focus:border-slate-100 focus:outline-none rounded-xl transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold shrink-0">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtrar por fase:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none focus:bg-white cursor-pointer"
          >
            <option value="todos">Todas las fases</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Contactado">Contactado</option>
            <option value="Demo Programada">Demo Programada</option>
            <option value="Propuesta Enviada">Propuesta Enviada</option>
            <option value="Cerrado - Ganado">Cerrado - Ganado</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-4">Contacto</th>
                <th className="py-4 px-4">Fecha Alta</th>
                <th className="py-4 px-4">Fase</th>
                <th className="py-4 px-4">Etiquetas</th>
                <th className="py-4 px-4">Notas</th>
                <th className="py-4 px-6 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-medium">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shadow-inner">
                        {client.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{client.name}</span>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4 space-y-1">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {client.phone}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-500 font-normal">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {client.email}
                      </span>
                    </td>

                    {/* Creation Date */}
                    <td className="py-4 px-4 text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {client.creationDate}
                      </span>
                    </td>

                    {/* Status Phase */}
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        client.status === 'Cerrado - Ganado' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                          : client.status === 'Propuesta Enviada'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50'
                            : client.status === 'Demo Programada'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100/50'
                              : client.status === 'Contactado'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100/50'
                                : 'bg-slate-100 text-slate-600 border border-slate-200/50'
                      }`}>
                        {client.status}
                      </span>
                    </td>

                    {/* Labels */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {client.labels && client.labels.map((label, idx) => (
                          <span key={idx} className="flex items-center gap-0.5 text-[9px] font-bold bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            <Tag className="h-2 w-2" />
                            {label}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-4 px-4 max-w-[200px] truncate text-slate-400 font-normal" title={client.notes}>
                      {client.notes || 'Sin anotaciones'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <button 
                        onClick={() => onDeleteClient(client.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar Cliente"
                      >
                        <Trash className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold">
                    No se encontraron clientes que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100/60 overflow-hidden animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Añadir Nuevo Cliente</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1.5 rounded-lg hover:bg-slate-50"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                />
              </div>

              {/* Contact Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +34 600..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Correo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ej. juan@..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Status Phase & Labels */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Fase Funnel</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Demo Programada">Demo Programada</option>
                    <option value="Propuesta Enviada">Propuesta Enviada</option>
                    <option value="Cerrado - Ganado">Cerrado - Ganado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Etiquetas (coma sep)</label>
                  <input
                    type="text"
                    value={labels}
                    onChange={(e) => setLabels(e.target.value)}
                    placeholder="Ej. VIP, Interesado"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Notas de Seguimiento</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles importantes..."
                  rows="3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:bg-white text-xs font-semibold resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/10 transition-all"
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
