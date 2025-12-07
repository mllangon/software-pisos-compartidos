"use client";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <nav className="flex items-center gap-2 text-sm">
      <button
        onClick={handleLogout}
        className="rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-zinc-200 hover:bg-zinc-900 transition-colors"
      >
        Cerrar sesión
      </button>
    </nav>
  );
}


