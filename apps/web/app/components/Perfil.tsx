"use client";
import { useState, useEffect } from "react";
import { extractErrorMessage, handleNetworkError } from "../utils/error-handler";

type Profile = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
};

type Props = {
  token: string | null;
};

export default function Perfil({ token }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    avatarUrl: "",
    bio: "",
    phone: "",
  });

  const loadProfile = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      const data = await res.json();
      setProfile(data);
      setFormData({
        name: data.name || "",
        avatarUrl: data.avatarUrl || "",
        bio: data.bio || "",
        phone: data.phone || "",
      });
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const errorMsg = await extractErrorMessage(res);
        throw new Error(errorMsg);
      }
      const updated = await res.json();
      setProfile(updated);
      setMessage("Perfil actualizado correctamente");
      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 1500);
    } catch (err: any) {
      const errorMsg = handleNetworkError(err);
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convertir a base64 para almacenamiento temporal
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({ ...prev, avatarUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Botón de perfil */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 px-3 py-2 text-sm text-white transition-colors hover:bg-zinc-700/50"
      >
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-700 text-xs font-semibold">
            {profile ? getInitials(profile.name) : "U"}
          </div>
        )}
        <span className="hidden md:inline">{profile?.name || "Perfil"}</span>
      </button>

      {/* Modal de perfil */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => {
            setShowModal(false);
            setMessage("");
          }}
        >
          <div
            className="w-full max-w-2xl rounded-lg border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Mi perfil</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setMessage("");
                }}
                className="text-zinc-400 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>

            {loading && !profile ? (
              <div className="py-8 text-center text-sm text-zinc-400">Cargando perfil...</div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                {/* Foto de perfil */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800 border border-zinc-700 text-xl font-semibold text-zinc-400">
                        {getInitials(formData.name || "Usuario")}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-zinc-400 mb-1">
                      Foto de perfil
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-zinc-700 file:text-white hover:file:bg-zinc-600"
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      O pega una URL de imagen en el campo de abajo
                    </p>
                  </div>
                </div>

                {/* Nombre */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                    required
                  />
                </div>

                {/* Email (solo lectura) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full rounded border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-zinc-500">El correo no se puede modificar</p>
                </div>

                {/* Teléfono */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                    placeholder="+34 600 000 000"
                  />
                </div>

                {/* URL de avatar (alternativa) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    URL de foto de perfil
                  </label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>

                {/* Biografía */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Información personal
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    className="w-full rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                    rows={4}
                    placeholder="Escribe algo sobre ti..."
                  />
                </div>

                {message && (
                  <p className={`text-xs ${message.includes("Error") ? "text-red-400" : "text-green-400"}`}>
                    {message}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setMessage("");
                    }}
                    className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded border border-zinc-600 bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
                    disabled={loading}
                  >
                    {loading ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

