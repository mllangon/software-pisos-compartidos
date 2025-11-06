import './globals.css';
import type { Metadata } from 'next';
import NavBar from './components/NavBar';

export const metadata: Metadata = {
  title: 'Software pisos compartidos',
  description: 'Gestión de gastos, tareas y miembros de pisos compartidos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="border-b border-zinc-800 bg-zinc-950/40 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <a href="/" className="text-sm font-semibold text-white hover:text-zinc-300">Pisos compartidos</a>
            <NavBar />
          </div>
        </header>
        <main>
          {children}
        </main>
        <footer className="mt-8 border-t border-zinc-800/80 bg-zinc-950/30">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-zinc-400">
            <span>© {new Date().getFullYear()} Pisos compartidos</span>
            <nav className="flex items-center gap-2">
              <a href="/" className="hover:text-zinc-200">Inicio</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}


