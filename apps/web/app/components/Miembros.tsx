"use client";
import { useState } from "react";
import { extractErrorMessage, handleNetworkError } from "../utils/error-handler";

type Member = {
  id: string;
  role: string;
  user: { id: string; email: string; name: string };
};

type Props = {
  groupId: string | null;
  token: string | null;
  members: Member[];
  onInviteSent: () => void;
};

export default function Miembros({ groupId, token, members, onInviteSent }: Props) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [rulesMsg, setRulesMsg] = useState("");
  const [loading, setLoading] = useState(false);

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
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      setInviteEmail("");
      setInviteMsg("Invitación enviada correctamente");
      setShowInviteModal(false);
      onInviteSent();
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setInviteMsg(errorMsg);
    }
  };

  // Obtener userId del token
  const getUserIdFromToken = () => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      return null;
    }
  };

  const currentUserId = getUserIdFromToken();
  const currentUser = members.find((m) => m.user.id === currentUserId);
  const isOwner = currentUser?.role === "owner";

  const loadRules = async () => {
    if (!token || !groupId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/groups/${groupId}/rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setRules(data.rules || "");
      setIsEditing(false);
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setRulesMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRules = () => {
    setShowRulesModal(true);
    loadRules();
  };

  const handleSaveRules = async () => {
    if (!token || !groupId) return;
    setRulesMsg("");
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/groups/${groupId}/rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rules }),
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      setRulesMsg("Reglas actualizadas correctamente");
      setIsEditing(false);
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setRulesMsg(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!groupId) {
    return <div className="text-sm text-zinc-400">Selecciona un grupo para ver los miembros</div>;
  }

  return (
    <div className="space-y-6">
      {/* Lista de miembros */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4 text-center text-sm text-zinc-400">
            Cargando miembros...
          </div>
        ) : (
          members.map((m) => (
            <div key={m.id} className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white">{m.user.name}</div>
                  <div className="mt-1 text-xs text-zinc-400">{m.user.email}</div>
                </div>
                <span className={`ml-3 rounded px-2 py-1 text-xs font-medium ${
                  m.role === "owner" 
                    ? "bg-zinc-700 text-zinc-200" 
                    : "bg-zinc-900/50 text-zinc-300"
                }`}>
                  {m.role === "owner" ? "Propietario" : "Miembro"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Botón Invitar miembro */}
      <button
        onClick={() => setShowInviteModal(true)}
        className="w-full rounded-lg border border-zinc-600 bg-zinc-800/30 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700/50"
      >
        Invitar miembro
      </button>

      {/* Ajustes del piso */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">Ajustes del piso</h3>
        <div className="space-y-2">
          <button 
            onClick={handleOpenRules}
            className="w-full text-left text-sm text-zinc-300 transition-colors hover:text-white"
          >
            Reglas del piso
          </button>
          <button className="w-full text-left text-sm text-zinc-300 transition-colors hover:text-white">
            Información compartida
          </button>
          <button className="w-full text-left text-sm text-zinc-300 transition-colors hover:text-white">
            Configuración general
          </button>
        </div>
      </div>

      {/* Modal de invitación */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Invitar miembro</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-400 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">Correo electrónico</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              {inviteMsg && (
                <p className={`text-xs ${inviteMsg.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                  {inviteMsg}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                >
                  Enviar invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de reglas del piso */}
      {showRulesModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => {
            setShowRulesModal(false);
            setIsEditing(false);
            setRulesMsg("");
          }}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Reglas del piso</h3>
              <button
                onClick={() => {
                  setShowRulesModal(false);
                  setIsEditing(false);
                  setRulesMsg("");
                }}
                className="text-zinc-400 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            {loading && !rules ? (
              <div className="py-8 text-center text-sm text-zinc-400">Cargando reglas...</div>
            ) : (
              <div className="space-y-4">
                {isOwner && isEditing ? (
                  <>
                    <textarea
                      value={rules}
                      onChange={(e) => setRules(e.target.value)}
                      className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                      rows={12}
                      placeholder="Escribe las reglas del piso aquí..."
                    />
                    {rulesMsg && (
                      <p className={`text-xs ${rulesMsg.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                        {rulesMsg}
                      </p>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          loadRules();
                        }}
                        className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                        disabled={loading}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveRules}
                        className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                        disabled={loading}
                      >
                        {loading ? "Guardando..." : "Guardar reglas"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded border border-zinc-700 bg-zinc-800/30 p-4">
                      {rules ? (
                        <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans">{rules}</pre>
                      ) : (
                        <p className="text-sm text-zinc-500 italic">No hay reglas definidas aún.</p>
                      )}
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                      >
                        Editar reglas
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





