"use client";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const Gastos = dynamic(() => import("../components/Gastos"), { ssr: false });
const Calendario = dynamic(() => import("../components/Calendario"), { ssr: false });
const Miembros = dynamic(() => import("../components/Miembros"), { ssr: false });
const Perfil = dynamic(() => import("../components/Perfil"), { ssr: false });
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; name: string };
};

export default function DashboardPage() {
  const router = useRouter();
  const params = useSearchParams();
  const groupId = params.get("groupId");
  const [members, setMembers] = useState<Member[]>([]);
  const [refreshCalendar, setRefreshCalendar] = useState(0);
  const [refreshGastos, setRefreshGastos] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        window.location.href = "/login";
        return;
      }
      setToken(storedToken);
      
      // Decodificar el token para obtener el userId (simple base64 decode)
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        setCurrentUserId(payload.sub);
      } catch (e) {
        console.error("Error decoding token:", e);
      }
    }
  }, []);

  const membersForEvents = members.map((m) => ({
    id: m.user.id,
    name: m.user.name,
    email: m.user.email,
  }));

  useEffect(() => {
    if (!token || !groupId) return;
    fetch(`http://localhost:3001/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }
        if (!r.ok) {
          throw new Error(await r.text());
        }
        return r.json();
      })
      .then((data) => {
        if (data) setMembers(data);
      })
      .catch((e) => console.error("Error loading members:", e));
  }, [token, groupId]);

  const handleInviteSent = async () => {
    if (!token || !groupId) return;
    const list = await fetch(`http://localhost:3001/groups/${groupId}/members`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    if (list.ok) setMembers(await list.json());
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-zinc-950 p-6">
        <div className="mx-auto w-full max-w-7xl">
          <div className="text-center text-zinc-400">Cargando...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 p-6">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-semibold text-white">Panel de gestión</h1>
          <div className="flex items-center gap-3">
            <Perfil token={token} />
            <button
              onClick={handleLogout}
              className="rounded-lg border border-zinc-700 bg-zinc-800/30 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-700/50"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Layout de 3 columnas */}
        <div className="grid grid-cols-12 gap-6">
          {/* Columna izquierda - Gastos (20%) */}
          <div className="col-span-12 lg:col-span-3">
            <Gastos 
              key={refreshGastos} 
              groupId={groupId} 
              token={token} 
              members={membersForEvents} 
              refreshTrigger={refreshGastos}
              currentUserId={currentUserId || undefined}
            />
          </div>

          {/* Columna central - Calendario (60-65%) */}
          <div className="col-span-12 lg:col-span-6">
            <Calendario
              key={refreshCalendar}
              groupId={groupId}
              token={token}
              members={membersForEvents}
              onExpenseCreated={() => setRefreshGastos((prev) => prev + 1)}
            />
          </div>

          {/* Columna derecha - Miembros (20%) */}
          <div className="col-span-12 lg:col-span-3">
            <Miembros
              groupId={groupId}
              token={token}
              members={members}
              onInviteSent={handleInviteSent}
            />
          </div>
          </div>
      </div>
    </main>
  );
}
