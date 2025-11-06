"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo123");
  const [name, setName] = useState("Demo User");
  const [message, setMessage] = useState<string>("");
  const [mode, setMode] = useState<"login" | "register">("login");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = mode === "login" ? "http://localhost:3001/auth/login" : "http://localhost:3001/auth/register";
      const body = mode === "login" ? { email, password } : { email, password, name };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Operación inválida");
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      setMessage(mode === "login" ? "Login correcto" : "Registro correcto");
      router.replace("/groups");
    } catch (err: any) {
      setMessage(err.message || "Error de login");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-zinc-700 bg-zinc-900/50 p-6">
        <h1 className="text-2xl font-semibold text-white">{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h1>
        <label className="block text-sm text-zinc-300">
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white" type="email" />
        </label>
        {mode === "register" && (
          <label className="block text-sm text-zinc-300">
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white" type="text" />
          </label>
        )}
        <label className="block text-sm text-zinc-300">
          Contraseña
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-800 p-2 text-white" type="password" />
        </label>
        <button type="submit" className="w-full rounded-md bg-indigo-600 p-2 text-white hover:bg-indigo-500">{mode === "login" ? "Entrar" : "Registrarme"}</button>
        {message && <p className="text-sm text-zinc-300">{message}</p>}
        <div className="flex items-center justify-between pt-2 text-sm">
          <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="rounded-md border border-zinc-700 bg-zinc-900/40 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900">
            {mode === "login" ? "Crear cuenta" : "Ya tengo cuenta"}
          </button>
          <a href="/" className="rounded-md border border-zinc-700 bg-zinc-900/40 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900">Inicio</a>
        </div>
      </form>
    </main>
  );
}


