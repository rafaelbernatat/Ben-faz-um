import React from 'react';
import { AppData, RSVPStatus } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, CheckCircle2, DollarSign, Users, Clock } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalBudget = data.details.totalBudget;
  let totalSpent = 0;
  data.categories.forEach(cat => cat.tasks.forEach(task => totalSpent += task.spent));

  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const chartData = [
    { name: 'Gasto', value: totalSpent },
    { name: 'Disponível', value: Math.max(0, remaining) },
  ];
  const COLORS = ['#f43f5e', '#10b981'];

  const guests = data.guests || [];
  const totalGuests = guests.length;
  const totalAdults = guests.reduce((sum, guest) => sum + guest.adults, 0);
  const totalKids = guests.reduce((sum, guest) => sum + guest.kids, 0);
  const totalPeople = totalAdults + totalKids;
  const confirmedCount = guests.filter(g => g.status === RSVPStatus.CONFIRMED).length;
  const pendingCount = guests.filter(g => g.status === RSVPStatus.PENDING).length;

  const eventDate = new Date(data.details.date);
  const diffTime = eventDate.getTime() - new Date().getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{data.details.title}</h1>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <Calendar className="w-4 h-4 mr-1.5 text-brand-500" />
            {eventDate.toLocaleDateString('pt-BR')}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${daysRemaining < 15 ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600'}`}>
            {daysRemaining > 0 ? `${daysRemaining} dias` : 'Hoje!'}
          </div>
        </div>
      </div>

      {/* Financial Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gasto Real</p>
          <p className="text-xl font-black text-slate-800">R$ {totalSpent.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Disponível</p>
          <p className={`text-xl font-black ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
            R$ {remaining.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h2 className="text-sm font-bold text-slate-500 mb-4 flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-brand-500" /> Resumo Financeiro
        </h2>
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={8} dataKey="value" stroke="none">
                {chartData.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
            <span className="text-lg font-black text-slate-800">{Math.round((totalSpent/totalBudget)*100)}%</span>
          </div>
        </div>
      </div>

      {/* Guest Status */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <h2 className="text-sm font-bold text-slate-500 mb-4 flex items-center">
          <Users className="w-4 h-4 mr-1 text-brand-500" /> Convidados
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {totalGuests} convidados • {totalPeople} pessoas • {totalAdults} adultos • {totalKids} criancas
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{totalGuests}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-sky-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{totalAdults}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Adultos</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{totalKids}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Criancas</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{confirmedCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Confirmados</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{pendingCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Pendentes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;