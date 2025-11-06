"use client";
import { useEffect, useMemo, useState } from "react";

type Tarea = {
  id: string;
  nombre: string;
  tarea: string;
  fecha: string; // ISO date (YYYY-MM-DD)
  creadaEn: number;
};

const STORAGE_KEY = "tareas:list";

export default function Tareas() {
  const [nombre, setNombre] = useState("");
  const [tarea, setTarea] = useState("");
  const [fecha, setFecha] = useState<string>("");
  const [tareas, setTareas] = useState<Tarea[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTareas(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
    } catch {}
  }, [tareas]);

  const canAdd = useMemo(() => nombre.trim() && tarea.trim() && fecha.trim(), [nombre, tarea, fecha]);

  const addTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    const nueva: Tarea = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      tarea: tarea.trim(),
      fecha,
      creadaEn: Date.now(),
    };
    setTareas((prev) => [nueva, ...prev]);
    setNombre("");
    setTarea("");
    setFecha("");
  };

  const removeTarea = (id: string) => setTareas((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="space-y-4">
      <form onSubmit={addTarea} className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-base font-medium text-white">Añadir tarea</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <label className="text-sm text-zinc-300">
            Nombre
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="p. ej. Laura"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Tarea
            <input
              value={tarea}
              onChange={(e) => setTarea(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              placeholder="p. ej. Sacar basura"
            />
          </label>
          <label className="text-sm text-zinc-300">
            Fecha
            <input
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white"
              type="date"
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
        <div className="border-b border-zinc-800 px-4 py-2 text-sm font-medium text-white">Tareas</div>
        {tareas.length === 0 ? (
          <div className="px-4 py-3 text-sm text-zinc-300">No hay tareas todavía.</div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {tareas.map((t) => (
              <li key={t.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{t.nombre}</div>
                  <div className="truncate text-xs text-zinc-400">{t.tarea}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-300">{t.fecha}</span>
                  <button
                    onClick={() => removeTarea(t.id)}
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


