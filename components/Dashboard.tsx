import React from 'react';
import { AppData, RSVPStatus } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, CheckCircle2, DollarSign, Users } from 'lucide-react';

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalBudget = data.details.totalBudget;
  let totalSpent = 0;
  data.categories.forEach(cat => {
    cat.tasks.forEach(task => {
      totalSpent += task.spent;
    });
  });

  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const chartData = [
    { name: 'Gasto', value: totalSpent },
    { name: 'Disponível', value: Math.max(0, remaining) },
  ];
  const COLORS = ['#ef4444', '#10b981'];

  const confirmedAdults = data.guests
    .filter(g => g.status === RSVPStatus.CONFIRMED)
    .reduce((acc, g) => acc + g.adults, 0);
  const confirmedKids = data.guests
    .filter(g => g.status === RSVPStatus.CONFIRMED)
    .reduce((acc, g) => acc + g.kids, 0);
  const pendingCount = data.guests.filter(g => g.status === RSVPStatus.PENDING).length;

  const calculateDaysRemaining = () => {
    const eventDate = new Date(data.details.date);
    const today = new Date();
    const diffTime = eventDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="space-y-6 pb-24">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">{data.details.title}</h1>
        <div className="flex items-center text-slate-500 mt-2 text-sm">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(data.details.date).toLocaleDateString('pt-BR')}</span>
          <span className="mx-2">•</span>
          <span className={`${daysRemaining < 7 ? 'text-red-500 font-bold' : 'text-brand-600'}`}>
            {daysRemaining > 0 ? `${daysRemaining} dias restantes` : 'É hoje!'}
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold flex items-center mb-4">
          <DollarSign className="w-5 h-5 mr-2 text-brand-500" /> Financeiro
        </h2>
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400">Restante</span>
            <span className={`text-xl font-bold ${isOverBudget ? 'text-red-500' : 'text-slate-800'}`}>
              R$ {remaining.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-semibold flex items-center mb-4">
          <Users className="w-5 h-5 mr-2 text-brand-500" /> Convidados Confirmados
        </h2>
        <div className="flex justify-between items-center px-2 text-center">
            <div>
                <p className="text-3xl font-bold text-slate-800">{confirmedAdults + confirmedKids}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">Total</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div>
                <p className="text-xl font-semibold text-slate-700">{confirmedAdults}</p>
                <p className="text-xs text-slate-500">Adultos</p>
            </div>
            <div>
                <p className="text-xl font-semibold text-slate-700">{confirmedKids}</p>
                <p className="text-xs text-slate-500">Crianças</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;