export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white">Software de gestión de pisos compartidos</h1>
      <p className="text-zinc-300 max-w-prose text-center">
        Gestiona gastos, tareas y miembros de manera sencilla. Frontend Next.js + Tailwind, Backend NestJS.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <a className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 hover:bg-zinc-900" href="http://localhost:3001/health/ui" target="_blank" rel="noreferrer">
          <div className="font-semibold text-white">Probar API /health</div>
          <div className="text-sm text-zinc-400">Abre el endpoint de salud del backend</div>
        </a>
        <a className="rounded-lg border border-zinc-700 bg-zinc-900/40 p-4 hover:bg-zinc-900" href="https://nextjs.org/docs/app" target="_blank" rel="noreferrer">
          <div className="font-semibold text-white">App Router</div>
          <div className="text-sm text-zinc-400">Lee la documentación del App Router de Next.js</div>
        </a>
      </div>
      <div className="mt-10 flex items-center gap-2">
        <a href="/login" className="rounded-md border border-zinc-700 bg-indigo-600/80 px-4 py-2 text-white hover:bg-indigo-600">Siguiente: Login →</a>
      </div>
    </main>
  );
}


