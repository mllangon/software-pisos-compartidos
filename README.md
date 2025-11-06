# Software de gestión de pisos compartidos

Monorepo con Turborepo, `apps/web` (Next.js + Tailwind) y `apps/api` (NestJS).

Pasos:

1. pnpm install
2. pnpm dev

Servicios:
- Web: http://localhost:3000

## ARQUITECTURA

Arquitectura monorepo basada en Turborepo con dos aplicaciones separadas:

- `apps/web` (Next.js 14, App Router): interfaz React y Tailwind CSS. Ventajas: enrutado por archivos, buen rendimiento, DX moderna y capacidad de escalar componentes y páginas de forma independiente.
- `apps/api` (NestJS 10): API modular con controladores y servicios separados (autenticación JWT, usuarios, health). Ventajas: estructura de capas clara, inyección de dependencias y fácil extensión de dominios (gastos, tareas, miembros).
- Turborepo coordina scripts y caché de builds en todo el monorepo, permitiendo desarrollo paralelo (`pnpm dev`) y builds más rápidos.

¿Por qué esta elección?
- **Desacoplamiento**: el frontend y backend pueden evolucionar y desplegarse por separado.
- **Escalabilidad**: NestJS soporta dominios y módulos; Next.js escala bien en UI/SSR.
- **Productividad**: App Router + Tailwind agilizan la construcción de vistas; DI de NestJS reduce complejidad en lógica de negocio.
- **Rendimiento**: caché de Turborepo y buenas prácticas de Next/Nest.
- **Mantenibilidad**: convenciones fuertes y tipado con TypeScript en ambos lados.

## Requisitos técnicos

1. Node.js >= 18.17 (recomendado 20 LTS)
2. pnpm >= 9 (el proyecto usa `packageManager: pnpm@9`)
3. Puertos libres: 3000 (web) y 3001 (API)
4. SO: Windows, macOS o Linux (desarrollo probado en Windows)
5. TypeScript 5.x habilitado en ambos proyectos
6. Next.js 14.x con App Router y Tailwind CSS 3.x
7. NestJS 10.x con soporte CORS para `http://localhost:3000`
8. Turbo 2.x para orquestación de scripts y caché
9. Navegadores modernos con soporte ES2020+

Opcionales (para producción/futuro):
- Variables de entorno (p. ej., `JWT_SECRET`, `DATABASE_URL`).
- Docker y un orquestador (Docker Compose/Kubernetes) para despliegue.

## Cosas a añadir en un futuro

- Persistencia real de datos (PostgreSQL + ORM como Prisma) para gastos y tareas.
- Autenticación completa (registro, recuperación de contraseña) y roles/permiso por piso.
- División de gastos entre miembros, saldos y cierres mensuales.
- Adjuntar tickets/facturas y categorización avanzada de gastos.
- Recordatorios y notificaciones (email/push) para tareas con fecha.
- Vista calendario y rotación automática de tareas.
- Internacionalización (i18n) y accesibilidad (a11y) mejorada.
- Tests unitarios/e2e (Jest, Playwright) y CI/CD.
- Observabilidad (logs estructurados, métricas, tracing) y control de errores.

---

## Documento corto del proyecto (en cristiano)

### Qué estamos construyendo
Una app para pisos compartidos: gestionar grupos (el piso), invitar a la gente que vive contigo y, desde ahí, llevar gastos y tareas. Ya tenemos el esqueleto funcionando: login real, grupos, invitaciones, miembros y un dashboard inicial.

### Arquitectura (muy resumida)
- Backend: NestJS + Prisma + SQLite (en dev) + JWT.
- Frontend: Next.js 14 + React + Tailwind.
- Monorepo con Turbo y pnpm. Desde la raíz se levantan API y Web a la vez.

### Lo que ya está hecho
- Autenticación:
  - Registro y login con contraseñas cifradas (bcrypt).
  - Tokens JWT para proteger endpoints.
- Grupos:
  - Crear grupo (el creador es el owner).
  - Ver “mis grupos”.
  - Eliminar grupo (solo el owner; limpia invitados y miembros antes de borrar).
- Invitaciones:
  - Enviar invitación por email (queda como “pendiente”).
  - Ver invitaciones pendientes del usuario y aceptarlas.
- Miembros:
  - Ver lista de miembros del grupo en el dashboard (rol owner/member).
  - Invitar a nuevos miembros desde el panel del dashboard.
- Flujo de navegación:
  - Login/registro → página de grupos (`/groups`).
  - Crear grupo o aceptar invitación → entrar a dashboard (`/dashboard?groupId=...`).

### API disponible
- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/profile` (JWT).
- Groups:
  - `POST /groups` (crear), `GET /groups/mine` (mis grupos), `DELETE /groups/:id` (owner),
  - `GET /groups/invitations` (mis invitaciones), `POST /groups/invitations` (enviar),
  - `POST /groups/invitations/:id/accept` (aceptar),
  - `GET /groups/:id/members` (miembros).

### Modelo de datos (idea general)
- `User`, `Group`, `GroupMember` (rol owner/member), `Invitation` (status string: PENDING/ACCEPTED/...).

### Arranque local
```powershell
pnpm install
pnpm -C apps/api prisma:generate
pnpm -C apps/api prisma:migrate
pnpm dev
```
- Web: `http://localhost:3000`
- API: `http://localhost:3001`

### Requisitos ya cumplidos
- Login robusto y escalable (JWT + contraseñas cifradas).
- Persistencia con Prisma lista para crecer.
- Flujo de grupos, invitaciones y miembros funcional.
- UI simple para crear grupos, listar miembros e invitar.

### Próximos pasos sugeridos
- Seguridad/sesiones: Cookies HttpOnly + refresh tokens; selección de grupo por defecto.
- UX: ver invitaciones enviadas y su estado; roles en UI; recordar último `groupId`.
- Producto: módulo de gastos con saldos por miembro; módulo de tareas con rotaciones; actividad reciente.
- Infra: Postgres en entornos reales; variables de entorno; Docker/CI.