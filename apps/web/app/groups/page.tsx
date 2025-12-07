"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { extractErrorMessage, handleNetworkError } from "../utils/error-handler";

type Invitation = {
  id: string;
  inviteeEmail: string;
  status: string;
  group: { id: string; name: string };
  inviter: { id: string; name: string; email: string };
};

type Group = { id: string; name: string };

export default function GroupsHubPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [message, setMessage] = useState("");
  const [createdGroup, setCreatedGroup] = useState<{ id: string; name: string } | null>(null);
  const [myGroups, setMyGroups] = useState<Group[]>([]);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) return;
    // load invitations
    fetch("http://localhost:3001/groups/invitations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.text())))
      .then(setInvitations)
      .catch((e) => setMessage(String(e)));
    // load my groups
    fetch("http://localhost:3001/groups/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => (r.ok ? r.json() : Promise.reject(await r.text())))
      .then(setMyGroups)
      .catch((e) => setMessage(String(e)));
  }, [token]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      if (!token) throw new Error("No autenticado");
      const res = await fetch("http://localhost:3001/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      const g = await res.json();
      setCreatedGroup({ id: g.id, name: g.name });
      // refresh my groups list
      const list = await fetch("http://localhost:3001/groups/mine", { headers: { Authorization: `Bearer ${token}` } });
      if (list.ok) setMyGroups(await list.json());
      setName("");
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setMessage(errorMsg);
    }
  };

  const onAccept = async (id: string) => {
    setMessage("");
    try {
      if (!token) throw new Error("No autenticado");
      const res = await fetch(`http://localhost:3001/groups/invitations/${id}/accept`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      router.replace("/dashboard");
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setMessage(errorMsg);
    }
  };

  const onDelete = async (groupId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este grupo?")) return;
    setMessage("");
    try {
      if (!token) throw new Error("No autenticado");
      const res = await fetch(`http://localhost:3001/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      // refresh groups list
      const list = await fetch("http://localhost:3001/groups/mine", { headers: { Authorization: `Bearer ${token}` } });
      if (list.ok) setMyGroups(await list.json());
      setCreatedGroup(null);
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setMessage(errorMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Tu grupo</h1>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-700 bg-zinc-800/30 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-700/50"
        >
          Cerrar sesión
        </button>
      </div>
      <form onSubmit={onCreate} className="mb-6 space-y-3 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
        <label className="block text-sm text-zinc-300">
          Nombre del grupo
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white" />
        </label>
        <button className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500">Crear y continuar</button>
      </form>

      {createdGroup && (
        <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-900/50 p-4">
          <div className="mb-2 text-sm text-zinc-300">Grupo creado</div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-white">{createdGroup.name}</div>
            <div className="flex gap-2">
              <button onClick={() => router.replace(`/dashboard?groupId=${createdGroup.id}`)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500">Entrar</button>
              <button onClick={() => onDelete(createdGroup.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-500">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <h2 className="mb-2 text-xl font-semibold text-white">Tus grupos</h2>
      <div className="mb-6 space-y-2">
        {myGroups.length === 0 && <p className="text-sm text-zinc-400">Aún no perteneces a ningún grupo.</p>}
        {myGroups.map((g) => (
          <div key={g.id} className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900/40 p-3 text-zinc-200">
            <div className="text-white">{g.name}</div>
            <div className="flex gap-2">
              <button onClick={() => router.replace(`/dashboard?groupId=${g.id}`)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500">Entrar</button>
              <button onClick={() => onDelete(g.id)} className="rounded-md bg-red-600 px-3 py-1.5 text-white hover:bg-red-500">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mb-2 text-xl font-semibold text-white">Invitaciones pendientes</h2>
      <div className="space-y-2">
        {invitations.length === 0 && <p className="text-sm text-zinc-400">No tienes invitaciones pendientes.</p>}
        {invitations.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-900/40 p-3 text-zinc-200">
            <div>
              <div className="font-medium">{inv.group.name}</div>
              <div className="text-xs text-zinc-400">Invitado por {inv.inviter.name || inv.inviter.email}</div>
            </div>
            <button onClick={() => onAccept(inv.id)} className="rounded-md bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-500">Aceptar</button>
          </div>
        ))}
      </div>

      {message && <p className="mt-4 text-sm text-red-300">{message}</p>}
    </main>
  );
}


