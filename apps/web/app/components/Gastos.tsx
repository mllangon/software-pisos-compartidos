"use client";
import { useEffect, useMemo, useState } from "react";

type Expense = {
  id: string;
  amount: number;
  description: string;
  category?: string;
  date: string;
  payer: { id: string; name: string };
};

type Props = {
  groupId: string | null;
  token: string | null;
  members: Array<{ id: string; name: string; email: string }>;
  refreshTrigger?: number;
  currentUserId?: string;
};

export default function Gastos({ groupId, token, members, refreshTrigger, currentUserId }: Props) {
  const [gastos, setGastos] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  useEffect(() => {
    if (!groupId || !token) return;
    loadGastos();
  }, [groupId, token, refreshTrigger]);

  const loadGastos = async () => {
    if (!groupId || !token) {
      console.warn("No groupId or token available", { groupId, hasToken: !!token });
      return;
    }
    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const res = await fetch(`http://localhost:3001/expenses/group/${groupId}?startDate=${startDate}&endDate=${endDate}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (res.ok) {
        const data = await res.json();
        setGastos(data);
      } else if (res.status === 401) {
        console.error("Token inválido o expirado. Por favor, inicia sesión nuevamente.");
      } else {
        const errorText = await res.text();
        console.error("Error loading expenses:", errorText);
      }
    } catch (e) {
      console.error("Error loading expenses:", e);
    } finally {
      setLoading(false);
    }
  };

  // Calcular resumen del mes
  const monthSummary = useMemo(() => {
    const total = gastos.reduce((acc, g) => acc + g.amount, 0);
    
    // Calcular saldos individuales
    const balances: Record<string, { paid: number; share: number; balance: number }> = {};
    
    members.forEach(m => {
      balances[m.id] = { paid: 0, share: 0, balance: 0 };
    });

    gastos.forEach(gasto => {
      const payerId = gasto.payer.id;
      if (balances[payerId]) {
        balances[payerId].paid += gasto.amount;
      }
      
      // Por ahora, dividir igual entre todos los miembros
      // En el futuro se puede usar selectedParticipants
      const share = gasto.amount / members.length;
      members.forEach(m => {
        if (balances[m.id]) {
          balances[m.id].share += share;
        }
      });
    });

    // Calcular balance final
    Object.keys(balances).forEach(memberId => {
      const balance = balances[memberId];
      balance.balance = balance.paid - balance.share;
    });

    return { total, balances };
  }, [gastos, members]);

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [importe, setImporte] = useState<string>("");
  const [payerId, setPayerId] = useState("");
  const [message, setMessage] = useState("");

  const categorias = ["Comida", "Limpieza", "Internet", "Servicios", "Suministros", "Otros"];

  const canAdd = useMemo(() => {
    const value = Number(importe);
    return nombre.trim().length > 0 && categoria.trim().length > 0 && Number.isFinite(value) && value > 0;
  }, [nombre, categoria, importe]);

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const addGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd || !groupId || !token) return;

    setMessage("");
    try {
      const res = await fetch("http://localhost:3001/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          groupId,
          amount: Number(importe),
          description: nombre.trim(),
          category: categoria.trim() || undefined,
          payerId: payerId && payerId.trim() !== "" ? payerId : undefined,
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Sesión expirada. Por favor, recarga la página e inicia sesión nuevamente.");
        }
        const error = await res.text();
        throw new Error(error || "Error al crear el gasto");
      }

      setNombre("");
      setCategoria("");
      setImporte("");
      setPayerId("");
      setSelectedParticipants([]);
      loadGastos();
    } catch (err: any) {
      setMessage(err.message || "Error al crear gasto");
    }
  };

  const removeGasto = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:3001/expenses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        loadGastos();
      }
    } catch (e) {
      console.error("Error deleting expense:", e);
    }
  };

  if (!groupId) {
    return <div className="text-sm text-zinc-400">Selecciona un grupo para ver los gastos</div>;
  }

  if (!token) {
    return <div className="text-sm text-red-400">No estás autenticado. Por favor, inicia sesión.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumen de gastos del mes */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Resumen de gastos del mes</h3>
        <div className="mb-4 border-b border-zinc-700 pb-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-zinc-400">Total gastado</span>
            <span className="text-xl font-semibold text-white">{monthSummary.total.toFixed(2)} €</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Saldos individuales</div>
          {members.map((member) => {
            const balance = monthSummary.balances[member.id] || { balance: 0 };
            const isPositive = balance.balance > 0;
            const isNegative = balance.balance < 0;
            return (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{member.name}</span>
                <span className={`font-medium ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-zinc-400'}`}>
                  {balance.balance > 0 ? '+' : ''}{balance.balance.toFixed(2)} €
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulario Añadir gasto */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-300">Añadir gasto</h3>
        <form onSubmit={addGasto} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Nombre del gasto</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
              placeholder="Ej: Supermercado"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Importe (€)</label>
              <input
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                className="w-full rounded border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0.01"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Pagado por</label>
              <select
                value={payerId}
                onChange={(e) => setPayerId(e.target.value)}
                className="w-full rounded border border-zinc-600 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
              >
                <option value="">Seleccionar</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Participantes en el reparto</label>
            <div className="space-y-1.5">
              {members.map((member) => (
                <label key={member.id} className="flex items-center text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={selectedParticipants.includes(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                    className="mr-2 h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900/50 text-indigo-600 focus:ring-1 focus:ring-indigo-500"
                  />
                  {member.name}
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={!canAdd}
            className="w-full rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Añadir gasto
          </button>
          {message && <p className="text-xs text-red-400">{message}</p>}
        </form>
      </div>

      {/* Lista de gastos recientes */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30">
        <div className="border-b border-zinc-700 px-4 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">Gastos recientes</h3>
        </div>
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-zinc-400">Cargando gastos...</div>
        ) : gastos.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-zinc-400">No hay gastos registrados este mes.</div>
        ) : (
          <ul className="divide-y divide-zinc-700/50">
            {gastos.slice(0, 10).map((g) => (
              <li key={g.id} className="px-4 py-3 transition-colors hover:bg-zinc-800/20">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-white">{g.description}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                      {g.category && <span>{g.category}</span>}
                      {g.category && <span>•</span>}
                      <span>Pagado por {g.payer.name}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-200">{g.amount.toFixed(2)} €</span>
                    <button
                      onClick={() => removeGasto(g.id)}
                      className="rounded border border-zinc-600 bg-transparent px-2 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-300"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
