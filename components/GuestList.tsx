import React, { useMemo, useState } from "react";
import { AppData, Guest, RSVPStatus } from "../types";
import { UserPlus, User, Trash2, Check, X, Clock, Pencil } from "lucide-react";

interface GuestListProps {
  data: AppData;
  onUpdate: (data: AppData) => void;
}

const GuestList: React.FC<GuestListProps> = ({ data, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editGuest, setEditGuest] = useState<Partial<Guest>>({
    name: "",
    adults: 1,
    kids: 0,
    contact: "",
  });
  const [newGuest, setNewGuest] = useState<Partial<Guest>>({
    name: "",
    adults: 1,
    kids: 0,
    status: RSVPStatus.PENDING,
  });

  const addGuest = () => {
    if (!newGuest.name) return;
    const guest: Guest = {
      id: crypto.randomUUID(),
      name: newGuest.name,
      adults: newGuest.adults || 1,
      kids: newGuest.kids || 0,
      status: newGuest.status || RSVPStatus.PENDING,
      contact: newGuest.contact || "",
    };
    onUpdate({
      ...data,
      guests: [...data.guests, guest],
    });
    setNewGuest({
      name: "",
      adults: 1,
      kids: 0,
      status: RSVPStatus.PENDING,
      contact: "",
    });
    setShowAddForm(false);
  };

  const removeGuest = (id: string) => {
    if (!confirm("Remover convidado?")) return;
    onUpdate({
      ...data,
      guests: data.guests.filter((g) => g.id !== id),
    });
    if (editingGuestId === id) {
      setEditingGuestId(null);
    }
  };

  const updateStatus = (id: string, status: RSVPStatus) => {
    onUpdate({
      ...data,
      guests: data.guests.map((g) => (g.id === id ? { ...g, status } : g)),
    });
  };

  const startEdit = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setEditGuest({
      name: guest.name,
      adults: guest.adults,
      kids: guest.kids,
      contact: guest.contact,
    });
  };

  const cancelEdit = () => {
    setEditingGuestId(null);
  };

  const saveEdit = (id: string) => {
    if (!editGuest.name) return;
    onUpdate({
      ...data,
      guests: data.guests.map((g) =>
        g.id === id
          ? {
              ...g,
              name: editGuest.name || g.name,
              adults: editGuest.adults ?? g.adults,
              kids: editGuest.kids ?? g.kids,
              contact: editGuest.contact || "",
              status: editGuest.status || g.status,
            }
          : g,
      ),
    });
    setEditingGuestId(null);
  };

  const getStatusColor = (status: RSVPStatus) => {
    switch (status) {
      case RSVPStatus.CONFIRMED:
        return "bg-green-100 text-green-700 border-green-200";
      case RSVPStatus.DECLINED:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const totalGuests = data.guests.length;
  const totalAdults = data.guests.reduce((sum, guest) => sum + guest.adults, 0);
  const totalKids = data.guests.reduce((sum, guest) => sum + guest.kids, 0);
  const totalPeople = totalAdults + totalKids;
  const guestStatsByStatus = useMemo(() => {
    const getStats = (status: RSVPStatus) => {
      const filtered = data.guests.filter((guest) => guest.status === status);
      const adults = filtered.reduce((sum, guest) => sum + guest.adults, 0);
      const kids = filtered.reduce((sum, guest) => sum + guest.kids, 0);

      return {
        guests: filtered.length,
        adults,
        kids,
        totalPeople: adults + kids,
      };
    };

    return {
      confirmed: getStats(RSVPStatus.CONFIRMED),
      pending: getStats(RSVPStatus.PENDING),
      declined: getStats(RSVPStatus.DECLINED),
    };
  }, [data.guests]);

  return (
    <div className="pb-24 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            🎈 Turma da Festa
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {totalGuests} convidados • {totalPeople} pessoas • {totalAdults}{" "}
            adultos • {totalKids} criancas
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[11px] px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
              Confirmados: {guestStatsByStatus.confirmed.guests} (
              {guestStatsByStatus.confirmed.adults}A •{" "}
              {guestStatsByStatus.confirmed.kids}C •{" "}
              {guestStatsByStatus.confirmed.totalPeople}T)
            </span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
              Pendentes: {guestStatsByStatus.pending.guests} (
              {guestStatsByStatus.pending.adults}A •{" "}
              {guestStatsByStatus.pending.kids}C •{" "}
              {guestStatsByStatus.pending.totalPeople}T)
            </span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
              Recusados: {guestStatsByStatus.declined.guests} (
              {guestStatsByStatus.declined.adults}A •{" "}
              {guestStatsByStatus.declined.kids}C •{" "}
              {guestStatsByStatus.declined.totalPeople}T)
            </span>
          </div>
        </div>
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
              onChange={(e) =>
                setNewGuest({ ...newGuest, name: e.target.value })
              }
            />
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block font-medium">
                  Adultos
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newGuest.adults}
                  onChange={(e) =>
                    setNewGuest({
                      ...newGuest,
                      adults: parseInt(e.target.value) || 0,
                    })
                  }
                  onFocus={(e) => e.target.select()}
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block font-medium">
                  Crianças
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newGuest.kids}
                  onChange={(e) =>
                    setNewGuest({
                      ...newGuest,
                      kids: parseInt(e.target.value) || 0,
                    })
                  }
                  onFocus={(e) => e.target.select()}
                />
              </div>
            </div>
            <input
              className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
              placeholder="Contato (Opcional)"
              value={newGuest.contact}
              onChange={(e) =>
                setNewGuest({ ...newGuest, contact: e.target.value })
              }
            />
            <div className="flex justify-end gap-2 mt-2 pt-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-500 text-sm hover:bg-slate-50 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={addGuest}
                className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
              >
                Salvar
              </button>
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

        {data.guests.map((guest) => (
          <div
            key={guest.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {guest.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{guest.name}</h3>
                  <p className="text-xs text-slate-500">
                    {guest.adults} Adultos, {guest.kids} Crianças
                  </p>
                  {guest.contact && (
                    <p className="text-xs text-slate-400 mt-1">
                      {guest.contact}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(guest)}
                  className="text-slate-300 hover:text-slate-600 p-1"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeGuest(guest.id)}
                  className="text-slate-300 hover:text-red-500 p-1"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {editingGuestId === guest.id && (
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="space-y-3">
                  <input
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Nome da Família / Convidado"
                    value={editGuest.name}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, name: e.target.value })
                    }
                  />
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block font-medium">
                        Adultos
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={editGuest.adults}
                        onChange={(e) =>
                          setEditGuest({
                            ...editGuest,
                            adults: parseInt(e.target.value) || 0,
                          })
                        }
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block font-medium">
                        Crianças
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={editGuest.kids}
                        onChange={(e) =>
                          setEditGuest({
                            ...editGuest,
                            kids: parseInt(e.target.value) || 0,
                          })
                        }
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                  <input
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder="Contato (Opcional)"
                    value={editGuest.contact}
                    onChange={(e) =>
                      setEditGuest({ ...editGuest, contact: e.target.value })
                    }
                  />
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block font-medium">
                      Status
                    </label>
                    <select
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                      value={editGuest.status || guest.status}
                      onChange={(e) =>
                        setEditGuest({
                          ...editGuest,
                          status: e.target.value as RSVPStatus,
                        })
                      }
                    >
                      <option value={RSVPStatus.CONFIRMED}>Confirmado</option>
                      <option value={RSVPStatus.PENDING}>Pendente</option>
                      <option value={RSVPStatus.DECLINED}>Recusado</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 text-slate-500 text-sm hover:bg-white rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => saveEdit(guest.id)}
                      className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
              <span
                className={`text-xs px-2 py-1 rounded border ${getStatusColor(guest.status)} font-medium`}
              >
                {guest.status}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(guest.id, RSVPStatus.CONFIRMED)}
                  className={`p-2 rounded-full transition-colors ${guest.status === RSVPStatus.CONFIRMED ? "bg-green-100 text-green-600" : "bg-slate-50 text-slate-300 hover:bg-green-50 hover:text-green-400"}`}
                  title="Confirmar"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateStatus(guest.id, RSVPStatus.PENDING)}
                  className={`p-2 rounded-full transition-colors ${guest.status === RSVPStatus.PENDING ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-300 hover:bg-amber-50 hover:text-amber-400"}`}
                  title="Pendente"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateStatus(guest.id, RSVPStatus.DECLINED)}
                  className={`p-2 rounded-full transition-colors ${guest.status === RSVPStatus.DECLINED ? "bg-red-100 text-red-600" : "bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-400"}`}
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
