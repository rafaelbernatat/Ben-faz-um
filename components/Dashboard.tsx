import React, { useMemo, useState } from "react";
import { AppData, RSVPStatus } from "../types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Calendar,
  CalendarClock,
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
  const [calendarMonth, setCalendarMonth] = useState(
    data.details.date.slice(0, 7),
  );
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    string | null
  >(null);

  const totalBudget = data.details.totalBudget;

  const contractedVendors = useMemo(() => {
    return (data.vendorServices || []).reduce<
      {
        serviceName: string;
        optionName: string;
        quote: number;
        paymentDate?: string;
        paymentPlan: {
          id: string;
          date: string;
          amount: number;
          description?: string;
        }[];
      }[]
    >((acc, service) => {
      const selectedOption = (service.options || []).find(
        (option) => option.id === service.selectedOptionId,
      );

      if (!selectedOption) return acc;

      acc.push({
        serviceName: service.name,
        optionName: selectedOption.name || service.name,
        quote: selectedOption.quote || 0,
        paymentDate: selectedOption.paymentDate,
        paymentPlan: selectedOption.paymentPlan || [],
      });

      return acc;
    }, []);
  }, [data.vendorServices]);

  const contractedTotal = contractedVendors.reduce(
    (sum, vendor) => sum + vendor.quote,
    0,
  );

  const chosenTotal = useMemo(() => {
    return (data.vendorServices || []).reduce((sum, service) => {
      const chosenOption = (service.options || []).find(
        (option) => option.id === service.chosenOptionId,
      );
      return sum + (chosenOption?.quote || 0);
    }, 0);
  }, [data.vendorServices]);

  const totalSpent = contractedTotal;

  const remaining = totalBudget - totalSpent;
  const isOverBudget = remaining < 0;

  const financialChartData = [
    { name: "Gasto", value: totalSpent },
    { name: "Reservado", value: chosenTotal },
    { name: "Disponível", value: Math.max(0, remaining) },
  ];
  const financialColors = ["#f43f5e", "#0ea5e9", "#10b981"];

  const categoryChartData = useMemo(() => {
    return (data.vendorServices || [])
      .map((service) => {
        const options = service.options || [];
        const selectedOption = options.find(
          (option) => option.id === service.selectedOptionId,
        );
        const fallbackQuote = options.reduce((lowest, option) => {
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

  const cashFlowEntries = useMemo(() => {
    const fallbackDate = data.details.date;

    return contractedVendors
      .flatMap((vendor) => {
        const validPlan = (vendor.paymentPlan || []).filter(
          (payment) => payment.date && payment.amount > 0,
        );

        if (validPlan.length > 0) {
          return validPlan.map((payment) => ({
            id: payment.id,
            date: payment.date,
            amount: payment.amount,
            serviceName: vendor.serviceName,
            optionName: vendor.optionName,
            description: payment.description || "Parcela",
          }));
        }

        return [
          {
            id: `${vendor.serviceName}-${vendor.optionName}`,
            date: vendor.paymentDate || fallbackDate,
            amount: vendor.quote,
            serviceName: vendor.serviceName,
            optionName: vendor.optionName,
            description: "Pagamento único",
          },
        ];
      })
      .filter((entry) => entry.amount > 0 && Boolean(entry.date))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [contractedVendors, data.details.date]);

  const cashFlowByMonth = useMemo(() => {
    const grouped = cashFlowEntries.reduce(
      (acc, entry) => {
        const monthKey = entry.date.slice(0, 7);
        const current = acc.get(monthKey) || {
          monthKey,
          total: 0,
          items: [] as typeof cashFlowEntries,
        };

        current.total += entry.amount;
        current.items.push(entry);
        acc.set(monthKey, current);
        return acc;
      },
      new Map<
        string,
        {
          monthKey: string;
          total: number;
          items: typeof cashFlowEntries;
        }
      >(),
    );

    return Array.from(grouped.values()).sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey),
    );
  }, [cashFlowEntries]);

  const cashFlowByDate = useMemo(() => {
    return cashFlowEntries.reduce(
      (acc, entry) => {
        const current = acc.get(entry.date) || {
          date: entry.date,
          total: 0,
          items: [] as typeof cashFlowEntries,
        };

        current.total += entry.amount;
        current.items.push(entry);
        acc.set(entry.date, current);
        return acc;
      },
      new Map<
        string,
        {
          date: string;
          total: number;
          items: typeof cashFlowEntries;
        }
      >(),
    );
  }, [cashFlowEntries]);

  const calendarMatrix = useMemo(() => {
    const [yearRaw, monthRaw] = calendarMonth.split("-");
    const year = Number(yearRaw);
    const month = Number(monthRaw);

    if (!year || !month) {
      return { days: [] as Array<string | null>, monthLabel: "" };
    }

    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const days: Array<string | null> = [];
    for (let index = 0; index < firstDayOfMonth; index += 1) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      days.push(date);
    }

    const monthLabel = new Date(year, month - 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

    return { days, monthLabel };
  }, [calendarMonth]);

  const selectedDayData = selectedCalendarDate
    ? cashFlowByDate.get(selectedCalendarDate)
    : undefined;

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
        <div className="bg-gradient-to-br from-sky-50 to-white p-5 rounded-[2rem] border border-sky-100 shadow-sm dark:from-slate-900 dark:to-slate-900 dark:border-slate-700 col-span-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Reservado (Escolhidos)
          </p>
          <p className="text-xl font-black text-sky-600">
            R$ {chosenTotal.toLocaleString("pt-BR")}
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

      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm dark:border-slate-700">
        <h2 className="text-sm font-bold text-slate-500 mb-4 flex items-center">
          <CalendarClock className="w-4 h-4 mr-1 text-brand-500" />
          Calendário Financeiro
        </h2>

        {cashFlowByMonth.length === 0 ? (
          <p className="text-sm text-slate-400">
            Marque fornecedores como contratados e adicione parcelas para ver o
            fluxo de caixa.
          </p>
        ) : (
          <div className="space-y-3">
            {cashFlowByMonth.map((month) => {
              const [year, monthNumber] = month.monthKey.split("-");
              const monthDate = new Date(Number(year), Number(monthNumber) - 1);

              return (
                <div
                  key={month.monthKey}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {monthDate.toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-sm font-black text-slate-800">
                      R$ {month.total.toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {month.items.map((entry) => (
                      <div
                        key={`${month.monthKey}-${entry.id}`}
                        className="flex items-center justify-between text-xs bg-slate-50 rounded-lg px-2.5 py-2"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 truncate">
                            {entry.serviceName} • {entry.optionName}
                          </p>
                          <p className="text-slate-500 truncate">
                            {new Date(entry.date).toLocaleDateString("pt-BR")} •{" "}
                            {entry.description}
                          </p>
                        </div>
                        <p className="font-bold text-slate-700 pl-3 shrink-0">
                          R$ {entry.amount.toLocaleString("pt-BR")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="rounded-xl border border-slate-200 p-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Visão mensal
                </p>
                <input
                  type="month"
                  value={calendarMonth}
                  onChange={(event) => {
                    setCalendarMonth(event.target.value);
                    setSelectedCalendarDate(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700"
                />
              </div>

              <p className="text-sm font-black text-slate-700 capitalize">
                {calendarMatrix.monthLabel}
              </p>

              <div className="grid grid-cols-7 gap-1 text-[10px] font-bold text-slate-400 uppercase">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (weekday) => (
                    <div key={weekday} className="text-center py-1">
                      {weekday}
                    </div>
                  ),
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarMatrix.days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="h-10" />;
                  }

                  const dayData = cashFlowByDate.get(date);
                  const isSelected = selectedCalendarDate === date;
                  const dayNumber = Number(date.slice(-2));

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedCalendarDate(date)}
                      className={`h-10 rounded-lg text-xs font-semibold border transition-colors ${isSelected ? "bg-brand-600 text-white border-brand-600" : dayData ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-white text-slate-500 border-slate-200"}`}
                    >
                      {dayNumber}
                    </button>
                  );
                })}
              </div>

              {selectedCalendarDate && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600 uppercase">
                      {new Date(selectedCalendarDate).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                    <p className="text-sm font-black text-slate-800">
                      R$ {(selectedDayData?.total || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  {selectedDayData && selectedDayData.items.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedDayData.items.map((entry) => (
                        <div
                          key={`${entry.id}-selected-day`}
                          className="text-xs flex items-center justify-between bg-white rounded-md px-2 py-1.5"
                        >
                          <span className="text-slate-600 truncate pr-2">
                            {entry.serviceName} • {entry.description}
                          </span>
                          <span className="font-semibold text-slate-700 shrink-0">
                            R$ {entry.amount.toLocaleString("pt-BR")}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Nenhum valor programado para este dia.
                    </p>
                  )}
                </div>
              )}
            </div>
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
