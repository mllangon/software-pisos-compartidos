"use client";
import { useEffect, useState } from "react";
import { extractErrorMessage, handleNetworkError } from "../utils/error-handler";

type Event = {
  id: string;
  title: string;
  description?: string;
  type: "TASK" | "EVENT" | "REMINDER";
  date: string;
  completed: boolean;
  creator: { id: string; name: string };
  assignee?: { id: string; name: string };
};

type Expense = {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date: string;
  payer: { id: string; name: string };
};

type Member = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  groupId: string | null;
  token: string | null;
  members: Member[];
  onExpenseCreated?: () => void;
};

type ViewType = "month" | "week" | "list";

export default function Calendario({ groupId, token, members, onExpenseCreated }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState<Date | null>(null);
  const [modalType, setModalType] = useState<"event" | "expense">("event");
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  
  // Filtros
  const [showTasks, setShowTasks] = useState(true);
  const [showExpenses, setShowExpenses] = useState(true);
  const [showReminders, setShowReminders] = useState(true);
  const [viewType, setViewType] = useState<ViewType>("month");

  useEffect(() => {
    if (!groupId || !token) return;
    loadEvents();
    loadExpenses();
  }, [groupId, token, currentMonth, currentWeek, viewType]);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenuPos(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const loadEvents = async () => {
    if (!groupId || !token) return;
    try {
      let startDate: Date;
      let endDate: Date;

      if (viewType === "week") {
        // Calcular inicio y fin de la semana
        const weekStart = new Date(currentWeek);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Domingo
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sábado
        weekEnd.setHours(23, 59, 59, 999);
        
        startDate = weekStart;
        endDate = weekEnd;
      } else {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      }

      const res = await fetch(`http://localhost:3001/events/group/${groupId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Error loading events:", e);
    }
  };

  const loadExpenses = async () => {
    if (!groupId || !token) return;
    setLoading(true);
    try {
      let startDate: Date;
      let endDate: Date;

      if (viewType === "week") {
        // Calcular inicio y fin de la semana
        const weekStart = new Date(currentWeek);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Domingo
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // Sábado
        weekEnd.setHours(23, 59, 59, 999);
        
        startDate = weekStart;
        endDate = weekEnd;
      } else {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      }

      const res = await fetch(`http://localhost:3001/expenses/group/${groupId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (e) {
      console.error("Error loading expenses:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDayContextMenu = (e: React.MouseEvent, date: Date | null) => {
    if (!date) return;
    e.preventDefault();
    setModalDate(date);
    setModalType("event");
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowModal(true);
  };

  const handleCreateEvent = async (eventData: { title: string; description?: string; type: string; assignedTo?: string }) => {
    if (!groupId || !token || !modalDate) return;

    try {
      const dateTime = new Date(modalDate);
      const hours = dateTime.getHours();
      const minutes = dateTime.getMinutes();
      
      // Si no tiene hora, usar la hora actual
      if (hours === 0 && minutes === 0) {
        const now = new Date();
        dateTime.setHours(now.getHours());
        dateTime.setMinutes(now.getMinutes());
      }

      const res = await fetch("http://localhost:3001/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          title: eventData.title,
          description: eventData.description?.trim() || undefined,
          type: eventData.type,
          date: dateTime.toISOString(),
          assignedTo: eventData.assignedTo && eventData.assignedTo.trim() !== "" ? eventData.assignedTo : undefined,
        }),
      });

      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }

      setShowModal(false);
      setModalDate(null);
      setContextMenuPos(null);
      loadEvents();
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      alert(errorMsg);
    }
  };

  const handleCreateExpense = async (expenseData: { amount: number; description: string; payerId?: string }) => {
    if (!groupId || !token || !modalDate) return;

    try {
      const dateTime = new Date(modalDate);
      const now = new Date();
      dateTime.setHours(now.getHours());
      dateTime.setMinutes(now.getMinutes());

      const res = await fetch("http://localhost:3001/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          amount: expenseData.amount,
          description: expenseData.description.trim(),
          payerId: expenseData.payerId && expenseData.payerId.trim() !== "" ? expenseData.payerId : undefined,
          date: dateTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }

      setShowModal(false);
      setModalDate(null);
      setContextMenuPos(null);
      loadExpenses();
      if (onExpenseCreated) onExpenseCreated();
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      alert(errorMsg);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((e) => {
      if (!e.date.startsWith(dateStr)) return false;
      if (e.type === "TASK" && !showTasks) return false;
      if (e.type === "REMINDER" && !showReminders) return false;
      if (e.type === "EVENT" && !showTasks) return false; // Eventos se muestran con tareas
      return true;
    });
  };

  const getExpensesForDate = (date: Date | null) => {
    if (!date || !showExpenses) return [];
    const dateStr = date.toISOString().split("T")[0];
    return expenses.filter((e) => e.date.startsWith(dateStr));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", { year: "numeric", month: "long" });
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const getWeekDays = () => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Domingo
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatWeekRange = () => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const startStr = weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    const endStr = weekEnd.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    return `${startStr} - ${endStr}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "TASK":
        return "bg-zinc-700 border-l-2 border-zinc-500";
      case "EVENT":
        return "bg-zinc-700 border-l-2 border-zinc-400";
      case "REMINDER":
        return "bg-zinc-700 border-l-2 border-zinc-300";
      default:
        return "bg-zinc-700";
    }
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (!groupId) {
    return <div className="text-sm text-zinc-400">Selecciona un grupo para ver el calendario</div>;
  }

  const filteredEvents = events.filter((e) => {
    if (e.type === "TASK" && !showTasks) return false;
    if (e.type === "REMINDER" && !showReminders) return false;
    if (e.type === "EVENT" && !showTasks) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header con navegación y selector de vista */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={viewType === "week" ? prevWeek : prevMonth} 
            className="rounded border border-zinc-600 bg-zinc-800/30 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700/50"
          >
            ←
          </button>
          <span className="min-w-[200px] text-center text-sm font-semibold text-white">
            {viewType === "week" ? formatWeekRange() : formatDate(currentMonth)}
          </span>
          <button 
            onClick={viewType === "week" ? nextWeek : nextMonth} 
            className="rounded border border-zinc-600 bg-zinc-800/30 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700/50"
          >
            →
          </button>
        </div>
        
        {/* Selector de vista */}
        <div className="flex items-center gap-2 rounded border border-zinc-600 bg-zinc-800/30 p-1">
          <button
            onClick={() => {
              setViewType("month");
              setCurrentWeek(new Date());
            }}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewType === "month"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => {
              setViewType("week");
              setCurrentWeek(new Date());
            }}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewType === "week"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setViewType("list")}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewType === "list"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Lista
          </button>
        </div>
      </div>

      {/* Barra de filtros */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">Filtros:</span>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={showTasks}
              onChange={(e) => setShowTasks(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900/50 text-indigo-600 focus:ring-1 focus:ring-indigo-500"
            />
            <span>Tareas</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={showExpenses}
              onChange={(e) => setShowExpenses(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900/50 text-green-600 focus:ring-1 focus:ring-green-500"
            />
            <span>Gastos</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={showReminders}
              onChange={(e) => setShowReminders(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900/50 text-yellow-600 focus:ring-1 focus:ring-yellow-500"
            />
            <span>Recordatorios</span>
          </label>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-6 text-center text-sm text-zinc-400">
          Cargando eventos y gastos...
        </div>
      ) : viewType === "month" ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-zinc-800">
            {weekDays.map((day) => (
              <div key={day} className="bg-zinc-800/50 p-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-700">
                {day}
              </div>
            ))}
            {days.map((date, idx) => {
              const dayEvents = getEventsForDate(date);
              const dayExpenses = getExpensesForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => date && setSelectedDate(date)}
                  onContextMenu={(e) => handleDayContextMenu(e, date)}
                  className={`min-h-[80px] bg-zinc-800/30 p-1.5 border border-zinc-700/50 ${isToday ? "bg-zinc-700/50 border-zinc-600" : ""} ${isSelected ? "ring-1 ring-zinc-500" : ""} cursor-pointer hover:bg-zinc-800/50 transition-colors`}
                >
                  {date && (
                    <>
                      <div className={`text-xs font-semibold mb-1 ${isToday ? "text-white" : "text-zinc-300"}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`${getTypeColor(event.type)} text-xs px-1.5 py-0.5 rounded truncate text-zinc-200 ${event.completed ? "opacity-50 line-through" : ""}`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayExpenses.slice(0, Math.max(0, 2 - dayEvents.length)).map((expense) => (
                          <div
                            key={expense.id}
                            className="bg-zinc-700 text-xs px-1.5 py-0.5 rounded border-l-2 border-green-500 truncate text-zinc-200"
                            title={`${expense.description} - ${expense.amount.toFixed(2)}€`}
                          >
                            {expense.amount.toFixed(2)}€
                          </div>
                        ))}
                        {(dayEvents.length + dayExpenses.length) > 2 && (
                          <div className="text-xs text-zinc-400 px-1">+{(dayEvents.length + dayExpenses.length) - 2} más</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : viewType === "week" ? (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 overflow-hidden">
          <div className="grid grid-cols-7 gap-px bg-zinc-800">
            {weekDays.map((day) => (
              <div key={day} className="bg-zinc-800/50 p-2 text-center text-xs font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-700">
                {day}
              </div>
            ))}
            {getWeekDays().map((date, idx) => {
              const dayEvents = getEventsForDate(date);
              const dayExpenses = getExpensesForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  onContextMenu={(e) => handleDayContextMenu(e, date)}
                  className={`min-h-[200px] bg-zinc-800/30 p-2 border border-zinc-700/50 ${isToday ? "bg-zinc-700/50 border-zinc-600" : ""} ${isSelected ? "ring-1 ring-zinc-500" : ""} cursor-pointer hover:bg-zinc-800/50 transition-colors`}
                >
                  <div className={`text-sm font-semibold mb-2 ${isToday ? "text-white" : "text-zinc-300"}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1.5">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`${getTypeColor(event.type)} text-xs px-2 py-1 rounded text-zinc-200 ${event.completed ? "opacity-50 line-through" : ""}`}
                        title={event.title}
                      >
                        <div className="truncate">{event.title}</div>
                        {event.assignee && (
                          <div className="text-xs text-zinc-400 mt-0.5">→ {event.assignee.name}</div>
                        )}
                      </div>
                    ))}
                    {dayExpenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="bg-zinc-700 text-xs px-2 py-1 rounded border-l-2 border-green-500 text-zinc-200"
                        title={`${expense.description} - ${expense.amount.toFixed(2)}€`}
                      >
                        <div className="truncate">{expense.description}</div>
                        <div className="text-xs font-semibold text-green-400 mt-0.5">{expense.amount.toFixed(2)}€</div>
                      </div>
                    ))}
                    {dayEvents.length === 0 && dayExpenses.length === 0 && (
                      <div className="text-xs text-zinc-500 italic">Sin eventos</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/30">
          <div className="divide-y divide-zinc-700/50">
            {filteredEvents.length === 0 && (!showExpenses || expenses.length === 0) ? (
              <div className="p-6 text-center text-sm text-zinc-400">No hay eventos ni gastos</div>
            ) : (
              <>
                {filteredEvents.map((event) => (
                  <div key={event.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`h-2 w-2 rounded-full mt-1.5 ${
                        event.type === "TASK" ? "bg-zinc-500" :
                        event.type === "EVENT" ? "bg-zinc-400" :
                        "bg-zinc-300"
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{event.title}</div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {new Date(event.date).toLocaleDateString("es-ES", { 
                            weekday: "long", 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                        {event.description && (
                          <div className="mt-1 text-xs text-zinc-500">{event.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {showExpenses && expenses.map((expense) => (
                  <div key={expense.id} className="p-4 hover:bg-zinc-800/20 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full mt-1.5 bg-green-500"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white">{expense.description}</div>
                        <div className="mt-1 text-xs text-zinc-400">
                          {new Date(expense.date).toLocaleDateString("es-ES", { 
                            weekday: "long", 
                            year: "numeric", 
                            month: "long", 
                            day: "numeric"
                          })} • {expense.amount.toFixed(2)}€
                        </div>
                        <div className="mt-1 text-xs text-zinc-500">Pagado por: {expense.payer.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-medium text-white">Eventos y gastos del {selectedDate.toLocaleDateString("es-ES")}</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setModalDate(selectedDate);
                  setModalType("expense");
                  setShowModal(true);
                }}
                className="rounded-md bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-500"
              >
                + Gasto
              </button>
              <button onClick={() => setSelectedDate(null)} className="text-sm text-zinc-400 hover:text-zinc-200">
                Cerrar
              </button>
            </div>
          </div>
          {getEventsForDate(selectedDate).length === 0 && getExpensesForDate(selectedDate).length === 0 ? (
            <p className="text-sm text-zinc-400">No hay eventos ni gastos este día</p>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map((event) => (
                <div key={event.id} className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${getTypeColor(event.type)}`}></span>
                        <span className={`font-medium text-white ${event.completed ? "line-through opacity-50" : ""}`}>{event.title}</span>
                      </div>
                      {event.description && <p className="mt-1 text-xs text-zinc-400">{event.description}</p>}
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                        <span>Tipo: {event.type}</span>
                        {event.assignee && <span>Asignado a: {event.assignee.name}</span>}
                        <span>Creado por: {event.creator.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {getExpensesForDate(selectedDate).map((expense) => (
                <div key={expense.id} className="rounded-md border border-green-800 bg-green-900/20 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-600"></span>
                        <span className="font-medium text-white">{expense.description}</span>
                        <span className="text-sm font-bold text-green-400">{expense.amount.toFixed(2)}€</span>
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                        <span>Pagado por: {expense.payer.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {viewType === "month" && (
        <div className="flex flex-wrap items-center gap-4 rounded-lg border border-zinc-700 bg-zinc-800/30 p-3 text-xs text-zinc-400">
          <span className="font-medium uppercase tracking-wide">Leyenda:</span>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-500"></span>
            <span>Tarea</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-400"></span>
            <span>Evento</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-zinc-300"></span>
            <span>Recordatorio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded border-l-2 border-green-500 bg-zinc-700"></span>
            <span>Gasto</span>
          </div>
        </div>
      )}

      {showModal && modalDate && (
        <EventModal
          date={modalDate}
          members={members}
          type={modalType}
          onClose={() => {
            setShowModal(false);
            setModalDate(null);
            setContextMenuPos(null);
          }}
          onCreateEvent={handleCreateEvent}
          onCreateExpense={handleCreateExpense}
        />
      )}
    </div>
  );
}

function EventModal({
  date,
  members,
  type,
  onClose,
  onCreateEvent,
  onCreateExpense,
}: {
  date: Date;
  members: Member[];
  type: "event" | "expense";
  onClose: () => void;
  onCreateEvent: (data: { title: string; description?: string; type: string; assignedTo?: string }) => void;
  onCreateExpense: (data: { amount: number; description: string; payerId?: string }) => void;
}) {
  const [activeTab, setActiveTab] = useState<"event" | "expense">(type);
  
  // Event fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState<"TASK" | "EVENT" | "REMINDER">("TASK");
  const [assignedTo, setAssignedTo] = useState("");
  const [time, setTime] = useState("12:00");
  
  // Expense fields
  const [amount, setAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [payerId, setPayerId] = useState("");

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dateTime = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    dateTime.setHours(hours, minutes);

    onCreateEvent({
      title: title.trim(),
      description: description.trim() || undefined,
      type: eventType,
      assignedTo: assignedTo && assignedTo.trim() !== "" ? assignedTo : undefined,
    });

    setTitle("");
    setDescription("");
    setEventType("TASK");
    setAssignedTo("");
    setTime("12:00");
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);
    if (!expenseDescription.trim() || !amountNum || amountNum <= 0) return;

    onCreateExpense({
      amount: amountNum,
      description: expenseDescription.trim(),
      payerId: payerId && payerId.trim() !== "" ? payerId : undefined,
    });

    setAmount("");
    setExpenseDescription("");
    setPayerId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-zinc-700 pb-3">
          <h3 className="text-lg font-semibold text-white">Añadir al calendario</h3>
          <button onClick={onClose} className="text-zinc-400 transition-colors hover:text-white">
            ✕
          </button>
        </div>
        <p className="mb-4 text-sm text-zinc-400">Fecha: {date.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mb-4 flex gap-2 border-b border-zinc-700">
          <button
            type="button"
            onClick={() => setActiveTab("event")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "event" ? "border-b-2 border-indigo-500 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Evento/Tarea
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "expense" ? "border-b-2 border-green-500 text-white" : "text-zinc-400 hover:text-white"
            }`}
          >
            Gasto
          </button>
        </div>

        {activeTab === "event" ? (
          <form onSubmit={handleSubmitEvent} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-1">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="Ej: Limpiar baño"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="Detalles adicionales..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">Tipo</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as "TASK" | "EVENT" | "REMINDER")}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              >
                <option value="TASK">Tarea</option>
                <option value="EVENT">Evento</option>
                <option value="REMINDER">Recordatorio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-1">Asignar a</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
            >
              <option value="">Nadie (sin asignar)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-white hover:bg-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </form>
        ) : (
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-300 mb-1">
                Descripción <span className="text-red-400">*</span>
              </label>
              <input
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
                placeholder="Ej: Supermercado"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1">
                Importe (€) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-300 mb-1">Pagado por</label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              >
                <option value="">Yo (usuario actual)</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded border border-zinc-600 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!expenseDescription.trim() || !amount || Number(amount) <= 0}
                className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

