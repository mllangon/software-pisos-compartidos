import { Controller, Get, Header } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return { status: 'ok' };
  }

  @Get('ui')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getHealthUi(): string {
    return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API · Salud</title>
    <style>
      :root{--bg:#0b1220;--card:#0f1629;--fg:#e5e7eb;--muted:#9ca3af;--ok:#22c55e;}
      html,body{height:100%}
      body{margin:0;background:radial-gradient(1200px 800px at 10% 10%,#0e172a 0%,#0b1220 35%),radial-gradient(1200px 800px at 90% 10%,#0b1220 0%,#0b1220 35%),radial-gradient(1200px 800px at 50% 90%,#0b1220 0%,#0b1220 35%);font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;color:var(--fg)}
      .wrap{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px}
      .card{max-width:720px;width:100%;background:rgba(15,22,41,.6);border:1px solid #1f2937;border-radius:16px;padding:24px}
      h1{margin:0 0 6px;font-size:28px}
      p{margin:0;color:var(--muted)}
      .status{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:8px 12px;border-radius:10px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.35);color:#bbf7d0}
      .dot{width:10px;height:10px;border-radius:9999px;background:var(--ok);box-shadow:0 0 12px var(--ok)}
      .links{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
      .a{color:#e5e7eb;text-decoration:none;border:1px solid #1f2937;background:rgba(2,6,23,.6);padding:8px 12px;border-radius:10px}
      .a:hover{background:#0b1220}
      code{background:#0b1220;border:1px solid #1f2937;border-radius:6px;padding:2px 6px}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="card">
        <h1>Estado de la API</h1>
        <p>Comprobación de salud del servicio NestJS.</p>
        <div class="status"><span class="dot"></span> status: ok</div>
        <div class="links">
          <a class="a" href="/health">Ver JSON</a>
          <a class="a" href="/">Ir al inicio de la API</a>
          <a class="a" href="http://localhost:3000/" target="_blank" rel="noreferrer">Abrir Web</a>
        </div>
        <p style="margin-top:12px;color:#9ca3af">Sugerencia: lanza todo con <code>pnpm dev</code>.</p>
      </div>
    </div>
  </body>
 </html>`;
  }
}


