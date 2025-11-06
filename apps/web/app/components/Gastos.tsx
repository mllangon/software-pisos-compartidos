"use client";
import { useEffect, useMemo, useState } from "react";

type Gasto = {
  id: string;
  nombre: string;
  tema: string;
  importe: number;
  creadoEn: number;
};

const STORAGE_KEY = "gastos:list";

export default function Gastos() {
  const [nombre, setNombre] = useState("");
  const [tema, setTema] = useState("");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [importe, setImporte] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        // Normaliza posibles entradas antiguas sin importe
        const normalized: Gasto[] = parsed.map((g) => ({
          id: g.id,
          nombre: g.nombre,
          tema: g.tema,
          importe: typeof g.importe === "number" ? g.importe : 0,
          creadoEn: g.creadoEn ?? Date.now(),
        }));
        setGastos(normalized);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gastos));
    } catch {}
  }, [gastos]);

  const canAdd = useMemo(() => {
    const value = Number(importe);
    return nombre.trim().length > 0 && tema.trim().length > 0 && Number.isFinite(value) && value > 0;
  }, [nombre, tema, importe]);

  const addGasto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    const nuevo: Gasto = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      tema: tema.trim(),
      importe: Number(importe),
      creadoEn: Date.now(),
    };
    setGastos((prev) => [nuevo, ...prev]);
    setNombre("");
    setTema("");
    setImporte("");
  };

  const removeGasto = (id: string) => {
    setGastos((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4">
      <form onSubmit={addGasto} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-base font-medium text-white">Añadir gasto</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="text-sm text-zinc-300">
            Nombre
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="p. ej. Supermercado"
            />
          </label>
          <label className="text-sm text-zinc-300 md:col-span-2">
            Tema
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="p. ej. Comida, Limpieza, Internet"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Importe (€)
            <input
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="0.00"
              inputMode="decimal"
              type="number"
              step="0.01"
              min="0"
            />
          </label>
        </div>
        <div className="mt-3">
          <button
            type="submit"
            disabled={!canAdd}
            className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-indigo-600/50"
          >
            Añadir
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-700 bg-zinc-900/50">
        <div className="border-b border-zinc-800 px-4 py-2 text-sm font-medium text-white flex items-center justify-between">
          <span>Gastos añadidos</span>
          <span className="text-xs text-zinc-300">
            Total: {gastos.reduce((acc, g) => acc + (Number.isFinite(g.importe) ? g.importe : 0), 0).toFixed(2)} €
          </span>
        </div>
        {gastos.length === 0 ? (
          <div className="px-4 py-3 text-sm text-zinc-300">No hay gastos todavía.</div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {gastos.map((g) => (
              <li key={g.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{g.nombre}</div>
                  <div className="truncate text-xs text-zinc-400">{g.tema}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-200">{g.importe.toFixed(2)} €</span>
                  <button
                    onClick={() => removeGasto(g.id)}
                    className="rounded-md border border-zinc-700 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-900"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}


