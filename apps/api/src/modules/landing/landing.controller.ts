import { Controller, Get, Header } from '@nestjs/common';

@Controller('/')
export class LandingController {
  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  root(): string {
    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API · Pisos compartidos</title>
    <style>
      :root{--bg:#0b1220;--card:#0f1629;--fg:#e5e7eb;--muted:#9ca3af;--accent:#6366f1;}
      html,body{height:100%}
      body{margin:0;background:radial-gradient(1200px 800px at 10% 10%,#0e172a 0%,#0b1220 35%),radial-gradient(1200px 800px at 90% 10%,#0b1220 0%,#0b1220 35%),radial-gradient(1200px 800px at 50% 90%,#0b1220 0%,#0b1220 35%);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;color:var(--fg)}
      .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px}
      .card{max-width:880px;width:100%;background:rgba(15,22,41,.6);border:1px solid #1f2937;border-radius:16px;padding:24px}
      h1{margin:0 0 4px;font-size:28px}
      p{margin:4px 0;color:var(--muted)}
      .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-top:16px}
      .item{border:1px solid #1f2937;background:rgba(2,6,23,.6);padding:12px;border-radius:12px}
      .item a{color:var(--fg);text-decoration:none}
      .item a:hover{text-decoration:underline}
      .badge{display:inline-block;padding:2px 8px;border-radius:9999px;background:rgba(99,102,241,.15);color:#c7d2fe;border:1px solid rgba(99,102,241,.35);font-size:12px}
      footer{margin-top:10px;color:#94a3b8;font-size:12px}
      code{background:#0b1220;border:1px solid #1f2937;border-radius:6px;padding:2px 6px}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
          <h1>API · Software de pisos compartidos</h1>
          <span class="badge">NestJS</span>
        </div>
        <p>Bienvenido. Aquí tienes algunos endpoints útiles para empezar:</p>
        <div class="grid">
          <div class="item">
            <strong>Salud</strong>
            <div><a href="/health">GET /health</a></div>
            <p class="muted">Comprueba que la API está viva.</p>
          </div>
          <div class="item">
            <strong>Auth (demo)</strong>
            <div><code>POST /auth/login</code></div>
            <p class="muted">Devuelve <code>access_token</code> con credenciales válidas.</p>
          </div>
          <div class="item">
            <strong>Web app</strong>
            <div><a href="http://localhost:3000/" target="_blank" rel="noreferrer">Abrir interfaz</a></div>
            <p class="muted">Frontend Next.js conectado a esta API.</p>
          </div>
        </div>
        <footer>
          Consejo: inicia el monorepo en desarrollo con <code>pnpm dev</code>.
        </footer>
      </div>
    </div>
  </body>
 </html>`;
  }
}



