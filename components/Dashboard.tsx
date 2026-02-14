import React, { useMemo, useState } from "react";
import { AppData, RSVPStatus } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Clock,
  X,
} from "lucide-react";

interface DashboardProps {
  data: AppData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [chartView, setChartView] = useState<"financial" | "category">(
    "financial",
  );

  const totalBudget = data.details.totalBudget;
  let totalSpent = 0;
  data.categories.forEach((cat) =>
    cat.tasks.forEach((task) => (totalSpent += task.spent)),
  );

  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const financialChartData = [
    { name: "Gasto", value: totalSpent },
    { name: "Disponível", value: Math.max(0, remaining) },
  ];
  const financialColors = ["#f43f5e", "#10b981"];

  const categoryChartData = useMemo(() => {
    return (data.vendorServices || [])
      .map((service) => {
        const selectedOption = service.options.find(
          (option) => option.id === service.selectedOptionId,
        );
        const fallbackQuote = service.options.reduce((lowest, option) => {
          if (!option.quote || option.quote <= 0) return lowest;
          if (lowest === 0) return option.quote;
          return Math.min(lowest, option.quote);
        }, 0);

        return {
          name: service.name,
          value: selectedOption?.quote || fallbackQuote,
        };
      })
      .filter((service) => service.value > 0);
  }, [data.vendorServices]);

  const categoryColors = [
    "#14b8a6",
    "#3b82f6",
    "#a855f7",
    "#f59e0b",
    "#f43f5e",
    "#22c55e",
  ];

  const guests = data.guests || [];
  const totalGuests = guests.length;
  const totalAdults = guests.reduce((sum, guest) => sum + guest.adults, 0);
  const totalKids = guests.reduce((sum, guest) => sum + guest.kids, 0);
  const totalPeople = totalAdults + totalKids;
  const guestStatsByStatus = useMemo(() => {
    const getStats = (status: RSVPStatus) => {
      const filtered = guests.filter((guest) => guest.status === status);
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
  }, [guests]);

  const activeChartData =
    chartView === "financial" ? financialChartData : categoryChartData;
  const activeChartColors =
    chartView === "financial" ? financialColors : categoryColors;
  const financialProgress =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const eventDate = new Date(data.details.date);
  const diffTime = eventDate.getTime() - new Date().getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-white to-sky-50 p-6 rounded-[2rem] shadow-sm border border-sky-100 dark:from-slate-900 dark:to-slate-900 dark:border-slate-700">
        <p className="text-[11px] font-bold text-sky-600 dark:text-sky-300 uppercase tracking-wider mb-1">
          🎉 Planejamento da Festa
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          {data.details.title}
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center text-slate-500 text-sm font-medium">
            <Calendar className="w-4 h-4 mr-1.5 text-brand-500" />
            {eventDate.toLocaleDateString("pt-BR")}
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${daysRemaining < 15 ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600"}`}
          >
            {daysRemaining > 0 ? `${daysRemaining} dias` : "Hoje!"}
          </div>
        </div>
      </div>

      {/* Financial Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-rose-50 to-white p-5 rounded-[2rem] border border-rose-100 shadow-sm dark:from-slate-900 dark:to-slate-900 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Gasto Real
          </p>
          <p className="text-xl font-black text-slate-800">
            R$ {totalSpent.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white p-5 rounded-[2rem] border border-emerald-100 shadow-sm dark:from-slate-900 dark:to-slate-900 dark:border-slate-700">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Disponível
          </p>
          <p
            className={`text-xl font-black ${isOverBudget ? "text-red-500" : "text-emerald-500"}`}
          >
            R$ {remaining.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:border-slate-700">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-bold text-slate-500 flex items-center">
            <DollarSign className="w-4 h-4 mr-1 text-brand-500" />
            {chartView === "financial"
              ? "Resumo Financeiro"
              : "Fornecedores por Categoria"}
          </h2>
          <div className="bg-slate-100 p-1 rounded-full flex items-center gap-1">
            <button
              onClick={() => setChartView("financial")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${chartView === "financial" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Financeiro
            </button>
            <button
              onClick={() => setChartView("category")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${chartView === "category" ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Categorias
            </button>
          </div>
        </div>
        <div className="h-48 w-full relative">
          {activeChartData.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center text-sm text-slate-400 font-medium">
              Sem dados para exibir
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {activeChartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={
                          activeChartColors[index % activeChartColors.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {chartView === "financial" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Status
                  </span>
                  <span className="text-lg font-black text-slate-800">
                    {financialProgress}%
                  </span>
                </div>
              )}
            </>
          )}
        </div>
        {activeChartData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {activeChartData.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        activeChartColors[index % activeChartColors.length],
                    }}
                  />
                  <span className="text-xs text-slate-600 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  R$ {item.value.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guest Status */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:border-slate-700">
        <h2 className="text-sm font-bold text-slate-500 mb-4 flex items-center">
          <Users className="w-4 h-4 mr-1 text-brand-500" /> Convidados
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          {totalGuests} convidados • {totalPeople} pessoas • {totalAdults}{" "}
          adultos • {totalKids} criancas
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{totalGuests}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Total
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-sky-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{totalAdults}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Adultos
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-rose-500" />
            </div>
            <p className="text-lg font-black text-slate-800">{totalKids}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">
              Criancas
            </p>
          </div>

          <div className="col-span-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm font-black text-emerald-700 uppercase tracking-wide">
                Confirmados
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">
                  {guestStatsByStatus.confirmed.adults}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Adultos
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center">
                <p className="text-lg font-black text-slate-800">
                  {guestStatsByStatus.confirmed.kids}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Criancas
                </p>
              </div>
              <div className="bg-emerald-600 rounded-xl p-3 text-center">
                <p className="text-lg font-black text-white">
                  {guestStatsByStatus.confirmed.totalPeople}
                </p>
                <p className="text-[10px] font-bold text-emerald-100 uppercase">
                  Total Pessoas
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-700 font-semibold mt-3">
              {guestStatsByStatus.confirmed.guests} convidados confirmados
            </p>
          </div>

          <div className="col-span-3 grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <p className="text-lg font-black text-slate-800">
                {guestStatsByStatus.pending.guests}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Pendentes
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {guestStatsByStatus.pending.adults}A •{" "}
                {guestStatsByStatus.pending.kids}C •{" "}
                {guestStatsByStatus.pending.totalPeople} Total
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-lg font-black text-slate-800">
                {guestStatsByStatus.declined.guests}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                Recusados
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {guestStatsByStatus.declined.adults}A •{" "}
                {guestStatsByStatus.declined.kids}C •{" "}
                {guestStatsByStatus.declined.totalPeople} Total
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
