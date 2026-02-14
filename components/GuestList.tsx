import React, { useState } from 'react';
import { AppData, Guest, RSVPStatus } from '../types';
import { UserPlus, User, Trash2, Check, X, Clock } from 'lucide-react';

interface GuestListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const GuestList: React.FC<GuestListProps> = ({ data, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: '',
    adults: 1,
    kids: 0,
    status: RSVPStatus.PENDING
  });

  const addGuest = () => {
    if (!newGuest.name) return;
    const guest: Guest = {
      id: crypto.randomUUID(),
      name: newGuest.name,
      adults: newGuest.adults || 1,
      kids: newGuest.kids || 0,
      status: newGuest.status || RSVPStatus.PENDING,
      contact: newGuest.contact || ''
    };
    onUpdate({
      ...data,
      guests: [...data.guests, guest]
    });
    setNewGuest({ name: '', adults: 1, kids: 0, status: RSVPStatus.PENDING, contact: '' });
    setShowAddForm(false);
  };

  const removeGuest = (id: string) => {
    if(!confirm("Remover convidado?")) return;
    onUpdate({
      ...data,
      guests: data.guests.filter(g => g.id !== id)
    });
  };

  const updateStatus = (id: string, status: RSVPStatus) => {
    onUpdate({
      ...data,
      guests: data.guests.map(g => g.id === id ? { ...g, status } : g)
    });
  };

  const getStatusColor = (status: RSVPStatus) => {
    switch (status) {
      case RSVPStatus.CONFIRMED: return 'bg-green-100 text-green-700 border-green-200';
      case RSVPStatus.DECLINED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="pb-24 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">Lista de Convidados</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center shadow-lg hover:bg-brand-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-5 rounded-xl shadow-md border border-slate-200 mb-6 animate-in slide-in-from-top-4">
          <h3 className="font-semibold mb-3 text-slate-700">Novo Convidado</h3>
          <div className="space-y-3">
            <input 
              className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Nome da Família / Convidado"
              value={newGuest.name}
              onChange={e => setNewGuest({...newGuest, name: e.target.value})}
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block font-medium">Adultos</label>
                <input 
                  type="number" min="1"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newGuest.adults}
                  onChange={e => setNewGuest({...newGuest, adults: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block font-medium">Crianças</label>
                <input 
                  type="number" min="0"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newGuest.kids}
                  onChange={e => setNewGuest({...newGuest, kids: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
             <input 
              className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Contato (Opcional)"
              value={newGuest.contact}
              onChange={e => setNewGuest({...newGuest, contact: e.target.value})}
            />
            <div className="flex justify-end gap-2 mt-2 pt-2">
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-500 text-sm hover:bg-slate-50 rounded-lg">Cancelar</button>
              <button onClick={addGuest} className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Salvar</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {data.guests.length === 0 && (
            <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <User className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Sua lista está vazia</p>
            </div>
        )}

        {data.guests.map(guest => (
          <div key={guest.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                 <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                    {guest.name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h3 className="font-semibold text-slate-800">{guest.name}</h3>
                    <p className="text-xs text-slate-500">{guest.adults} Adultos, {guest.kids} Crianças</p>
                    {guest.contact && <p className="text-xs text-slate-400 mt-1">{guest.contact}</p>}
                 </div>
              </div>
              <button onClick={() => removeGuest(guest.id)} className="text-slate-300 hover:text-red-500 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(guest.status)} font-medium`}>
                    {guest.status}
                </span>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => updateStatus(guest.id, RSVPStatus.CONFIRMED)}
                        className={`p-2 rounded-full transition-colors ${guest.status === RSVPStatus.CONFIRMED ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-300 hover:bg-green-50 hover:text-green-400'}`}
                        title="Confirmar"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => updateStatus(guest.id, RSVPStatus.PENDING)}
                        className={`p-2 rounded-full transition-colors ${guest.status === RSVPStatus.PENDING ? 'bg-amber-100 text-amber-600' : 'bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-400'}`}
                        title="Pendente"
                    >
                        <Clock className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => updateStatus(guest.id, RSVPStatus.DECLINED)}
                        className={`p-2 rounded-full transition-colors ${guest.status === RSVPStatus.DECLINED ? 'bg-red-100 text-red-600' : 'bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-400'}`}
                        title="Recusar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestList;