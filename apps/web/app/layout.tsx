import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software pisos compartidos',
  description: 'Gestión de gastos, tareas y miembros de pisos compartidos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}


