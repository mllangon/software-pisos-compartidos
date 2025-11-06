"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const Gastos = dynamic(() => import("../components/Gastos"), { ssr: false });
const Tareas = dynamic(() => import("../components/Tareas"), { ssr: false });

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; name: string };
};

export default function DashboardPage() {
  const params = useSearchParams();
  const groupId = params.get("groupId");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [members, setMembers] = useState<Member[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token || !groupId) return;
    fetch(`http://localhost:3001/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.text())))
      .then(setMembers)
      .catch((e) => console.error("Error loading members:", e));
  }, [token, groupId]);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMsg("");
    try {
      if (!token) throw new Error("No autenticado");
      if (!groupId) throw new Error("Grupo no seleccionado");
      const res = await fetch("http://localhost:3001/groups/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ groupId, inviteeEmail: inviteEmail }),
      });
      if (!res.ok) throw new Error(await res.text());
      setInviteEmail("");
      setInviteMsg("Invitación enviada");
      // refresh members list
      const list = await fetch(`http://localhost:3001/groups/${groupId}/members`, { headers: { Authorization: `Bearer ${token}` } });
      if (list.ok) setMembers(await list.json());
    } catch (err: any) {
      setInviteMsg(err.message || "Error al invitar");
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold text-white">Panel principal</h1>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
            <h2 className="mb-4 text-lg font-medium text-white">Gastos</h2>
            <Gastos />
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
            <h2 className="mb-4 text-lg font-medium text-white">Tareas</h2>
            <Tareas />
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
            <h2 className="mb-2 text-lg font-medium text-white">Miembros</h2>
            {groupId ? (
              <>
                <div className="mb-4 space-y-2">
                  {members.length === 0 ? (
                    <p className="text-sm text-zinc-400">Cargando miembros...</p>
                  ) : (
                    members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/60 p-2 text-sm text-zinc-200">
                        <div>
                          <div className="font-medium text-white">{m.user.name}</div>
                          <div className="text-xs text-zinc-400">{m.user.email}</div>
                        </div>
                        <span className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-300">{m.role === "owner" ? "Propietario" : "Miembro"}</span>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={sendInvite} className="space-y-3 border-t border-zinc-700 pt-3">
                  <label className="block text-sm text-zinc-300">
                    Invitar por email
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white" type="email" placeholder="correo@ejemplo.com" />
                  </label>
                  <button className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500">Enviar invitación</button>
                  {inviteMsg && <p className="text-sm text-zinc-300">{inviteMsg}</p>}
                </form>
              </>
            ) : (
              <p className="text-xs text-zinc-400">Abre el dashboard desde un grupo para ver miembros e invitar.</p>
            )}
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
            <h3 className="mb-2 text-base font-medium text-white">Actividad reciente</h3>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">• Aquí verás movimientos recientes de gastos y tareas</li>
              <li className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">• Esta sección es solo visual por ahora</li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-5">
            <h3 className="mb-2 text-base font-medium text-white">Próximos pasos</h3>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              <li>Autenticación real con base de datos</li>
              <li>Modelo de gastos y saldos por miembro</li>
              <li>Calendario y rotación de tareas</li>
            </ol>
          </div>
        </section>
      </div>
    </main>
  );
}



