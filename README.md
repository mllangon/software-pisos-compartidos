# Software de Gestión de Pisos Compartidos - Documentación Técnica Completa

## Tabla de Contenidos

1. [Introducción Extensa](#introducción-extensa)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Archivos y Justificación](#estructura-de-archivos-y-justificación)
4. [Requisitos Técnicos](#requisitos-técnicos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Problemas Encontrados y Soluciones](#problemas-encontrados-y-soluciones)
7. [Conclusión](#conclusión)

---

## Introducción Extensa

### ¿Qué estamos construyendo?

Este proyecto es una **aplicación web completa para la gestión de pisos compartidos**, diseñada para resolver los problemas comunes que enfrentan las personas que viven en viviendas compartidas. La aplicación permite a los usuarios crear grupos (representando cada piso compartido), invitar a otros usuarios mediante correo electrónico, gestionar miembros del grupo, y proporciona un dashboard centralizado desde donde se podrán gestionar gastos compartidos, tareas domésticas, y otras funcionalidades relacionadas con la convivencia.

### Contexto del Problema

Vivir en un piso compartido implica múltiples desafíos organizativos:
- **División de gastos**: Luz, agua, internet, compras comunes, etc.
- **Reparto de tareas**: Limpieza, compras, gestión de facturas, etc.
- **Comunicación**: Coordinación entre compañeros de piso
- **Transparencia**: Todos deben tener visibilidad de gastos y responsabilidades

Tradicionalmente, estos problemas se resuelven con hojas de cálculo compartidas, aplicaciones de mensajería, o simplemente "de palabra", lo que genera fricciones, olvidos, y falta de transparencia.

### Solución Propuesta

Nuestra aplicación centraliza toda esta gestión en una plataforma única donde:
- Cada usuario se registra con su correo electrónico y contraseña
- Los usuarios pueden crear grupos (pisos) o ser invitados a grupos existentes
- Cada grupo tiene un propietario (owner) que puede invitar a otros miembros
- El dashboard muestra información centralizada del grupo activo
- Los miembros pueden ver quién pertenece al grupo y sus roles
- La arquitectura está preparada para añadir módulos de gastos y tareas en el futuro

### Estado Actual del Proyecto

En esta fase inicial, hemos implementado la **infraestructura fundamental**:
- Sistema de autenticación completo con JWT y cifrado de contraseñas
- Gestión completa de grupos (crear, listar, eliminar)
- Sistema de invitaciones por correo electrónico
- Gestión de miembros con roles (owner/member)
- Dashboard básico con estructura preparada para módulos futuros
- Persistencia de datos con Prisma ORM y SQLite (desarrollo)

### Objetivos a Largo Plazo

Aunque aún no están implementados, la arquitectura está diseñada para soportar:
- Módulo de gastos compartidos con cálculo automático de saldos
- Módulo de tareas domésticas con rotación automática
- Sistema de notificaciones (email/push)
- Historial y reportes de actividad
- Integración con servicios de pago
- Aplicación móvil (React Native)

---

## Arquitectura del Sistema

### Visión General

El proyecto sigue una **arquitectura de monorepo** utilizando Turborepo, que permite gestionar múltiples aplicaciones relacionadas en un solo repositorio. Esta decisión arquitectónica ofrece ventajas significativas en términos de desarrollo, mantenimiento y despliegue.

### Arquitectura Monorepo

#### ¿Por qué Monorepo?

Un monorepo centraliza el código relacionado en un único repositorio, permitiendo:
- **Compartir código**: Tipos TypeScript, utilidades, componentes compartidos
- **Refactorizaciones seguras**: Cambios en API y frontend en un solo commit
- **Versionado unificado**: Una sola versión para todo el sistema
- **CI/CD simplificado**: Un solo pipeline para múltiples aplicaciones
- **Desarrollo coordinado**: Cambios en API y frontend sincronizados

#### Estructura del Monorepo

```
softwarePisosCompartidos/
├── apps/
│   ├── api/          # Backend NestJS
│   └── web/          # Frontend Next.js
├── packages/         # Código compartido (futuro)
├── package.json      # Configuración raíz
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### Arquitectura del Backend (API)

#### Stack Tecnológico

- **NestJS 10.x**: Framework Node.js basado en TypeScript
- **Prisma 5.x**: ORM moderno con type-safety
- **SQLite**: Base de datos para desarrollo (fácil migración a PostgreSQL)
- **JWT (JSON Web Tokens)**: Autenticación stateless
- **bcrypt**: Cifrado de contraseñas
- **Passport.js**: Estrategias de autenticación
- **class-validator**: Validación de DTOs
- **Express**: Servidor HTTP (a través de NestJS)

#### Arquitectura por Capas

NestJS sigue una arquitectura modular por capas:

1. **Capa de Controladores** (`*.controller.ts`): Manejan las peticiones HTTP, validan entrada, devuelven respuestas
2. **Capa de Servicios** (`*.service.ts`): Lógica de negocio, acceso a datos, transformaciones
3. **Capa de Módulos** (`*.module.ts`): Organizan dependencias, exportan/importan funcionalidad
4. **Capa de Guards** (`*.guard.ts`): Protección de rutas, autenticación/autorización
5. **Capa de Estrategias** (`*.strategy.ts`): Implementación de Passport para JWT

#### Flujo de una Petición

```
Cliente HTTP
    ↓
main.ts (bootstrap)
    ↓
AppModule (módulo raíz)
    ↓
Controller (ej: AuthController)
    ↓
Guard (JwtAuthGuard) - si requiere autenticación
    ↓
Service (ej: AuthService)
    ↓
PrismaService (acceso a BD)
    ↓
SQLite Database
```

#### Módulos del Backend

- **AppModule**: Módulo raíz que importa todos los demás
- **AuthModule**: Autenticación (registro, login, JWT)
- **UsersModule**: Gestión de usuarios y PrismaService
- **GroupsModule**: Gestión de grupos, miembros, invitaciones
- **HealthModule**: Endpoint de salud para monitoreo
- **LandingModule**: Página de bienvenida de la API

### Arquitectura del Frontend (Web)

#### Stack Tecnológico

- **Next.js 14.x**: Framework React con App Router
- **React 18.x**: Biblioteca UI
- **TypeScript 5.x**: Type-safety
- **Tailwind CSS 3.x**: Framework CSS utility-first
- **App Router**: Sistema de enrutado basado en archivos

#### Arquitectura de Next.js App Router

Next.js 14 introduce el App Router, que organiza la aplicación por rutas basadas en la estructura de carpetas:

```
app/
├── layout.tsx        # Layout raíz (NavBar, Footer)
├── page.tsx          # Página principal (/)
├── login/
│   └── page.tsx     # Página de login (/login)
├── groups/
│   └── page.tsx     # Página de grupos (/groups)
├── dashboard/
│   └── page.tsx     # Dashboard (/dashboard)
└── components/      # Componentes reutilizables
```

#### Flujo de Navegación

```
Usuario no autenticado
    ↓
/login (registro o login)
    ↓
Token guardado en localStorage
    ↓
/groups (crear grupo o aceptar invitación)
    ↓
/dashboard?groupId=xxx (panel principal)
```

#### Componentes Cliente vs Servidor

- **Server Components** (por defecto): Renderizado en servidor, sin JavaScript en cliente
- **Client Components** (`"use client"`): Interactividad, hooks, estado local

En nuestro proyecto:
- `layout.tsx`: Server Component (estático)
- `login/page.tsx`: Client Component (formularios, estado)
- `groups/page.tsx`: Client Component (fetching, estado)
- `dashboard/page.tsx`: Client Component (interactividad)

### Arquitectura de Datos

#### Modelo de Datos (Prisma Schema)

El esquema define 4 entidades principales:

1. **User**: Usuarios del sistema
   - `id`: Identificador único (CUID)
   - `email`: Correo único
   - `password`: Hash bcrypt
   - `name`: Nombre del usuario
   - Relaciones: `ownedGroups`, `memberships`, `invitations`

2. **Group**: Grupos (pisos compartidos)
   - `id`: Identificador único
   - `name`: Nombre del grupo
   - `ownerId`: Referencia al usuario propietario
   - Relaciones: `owner`, `members`, `invitations`

3. **GroupMember**: Relación muchos-a-muchos entre User y Group
   - `id`: Identificador único
   - `groupId`: Referencia al grupo
   - `userId`: Referencia al usuario
   - `role`: "owner" o "member"
   - Constraint único: un usuario no puede estar dos veces en el mismo grupo

4. **Invitation**: Invitaciones a grupos
   - `id`: Identificador único
   - `groupId`: Grupo al que se invita
   - `inviterId`: Usuario que invita
   - `inviteeEmail`: Correo del invitado
   - `status`: "PENDING", "ACCEPTED", "DECLINED", "EXPIRED"
   - Índice en `inviteeEmail` para búsquedas rápidas

#### Relaciones

- **User ↔ Group**: Muchos-a-muchos a través de `GroupMember`
- **User → Group**: Uno-a-muchos (ownedGroups, el usuario es owner)
- **Group → Invitation**: Uno-a-muchos (un grupo tiene muchas invitaciones)
- **User → Invitation**: Uno-a-muchos (un usuario puede enviar muchas invitaciones)

### Arquitectura de Autenticación

#### Flujo de Registro

```
Cliente: POST /auth/register { email, password, name }
    ↓
AuthController.register()
    ↓
AuthService.register()
    ↓
UsersService.findByEmail() - verificar si existe
    ↓
bcrypt.hash(password, 10) - cifrar contraseña
    ↓
UsersService.createUser() - crear usuario
    ↓
JWT.signAsync() - generar token
    ↓
Respuesta: { access_token, user }
```

#### Flujo de Login

```
Cliente: POST /auth/login { email, password }
    ↓
AuthController.login()
    ↓
AuthService.validateUser()
    ↓
UsersService.findByEmail() - buscar usuario
    ↓
bcrypt.compare(password, hash) - verificar contraseña
    ↓
JWT.signAsync() - generar token
    ↓
Respuesta: { access_token, user }
```

#### Protección de Rutas

```
Cliente: GET /groups/mine (con header Authorization: Bearer <token>)
    ↓
JwtAuthGuard.canActivate()
    ↓
JwtStrategy.validate() - extraer y validar token
    ↓
Request.user = { sub: userId, email: userEmail }
    ↓
GroupsController.mine() - ejecutar lógica
```

### Arquitectura de CORS

El backend está configurado para aceptar peticiones solo desde `http://localhost:3000`:

```typescript
app.enableCors({
  origin: [/http:\/\/localhost:3000$/],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

Esto previene ataques CSRF y asegura que solo el frontend autorizado pueda hacer peticiones.

---

## Estructura de Archivos y Justificación

### Estructura Raíz del Proyecto

#### `package.json` (raíz)

**Ubicación**: `/package.json`

**Contenido**:
- Scripts de Turborepo (`dev`, `build`, `lint`)
- Configuración de `packageManager: pnpm@9.1.0`
- Dependencias compartidas (turbo, husky)

**Justificación**: Este archivo coordina todos los scripts del monorepo. Turborepo ejecuta comandos en paralelo en todos los workspaces que tengan el script correspondiente.

#### `pnpm-workspace.yaml`

**Ubicación**: `/pnpm-workspace.yaml`

**Contenido**:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Justificación**: Define qué carpetas son "workspaces" de pnpm. Permite instalar dependencias desde la raíz y compartir paquetes entre apps.

#### `turbo.json`

**Ubicación**: `/turbo.json`

**Contenido**:
- Configuración de tareas (`build`, `dev`, `lint`)
- Dependencias entre tareas (`dependsOn`)
- Outputs para caché

**Justificación**: Turborepo usa este archivo para:
- Ejecutar tareas en paralelo cuando es posible
- Cachear builds basándose en outputs
- Gestionar dependencias entre tareas (ej: `build` depende de `^build`)

### Estructura del Backend (`apps/api/`)

#### `apps/api/src/main.ts`

**Ubicación**: `apps/api/src/main.ts`

**Responsabilidad**: Punto de entrada de la aplicación NestJS.

**Contenido**:
- Bootstrap de la aplicación NestJS
- Configuración de CORS
- Puerto del servidor (3001 por defecto, configurable con `PORT`)

**Justificación**: Este es el archivo estándar de NestJS. Aquí se inicializa la aplicación y se configuran middlewares globales como CORS.

#### `apps/api/src/modules/app.module.ts`

**Ubicación**: `apps/api/src/modules/app.module.ts`

**Responsabilidad**: Módulo raíz que importa todos los demás módulos.

**Contenido**:
- Importa `ConfigModule` (variables de entorno globales)
- Importa todos los módulos de dominio (Health, Users, Auth, Landing, Groups)

**Justificación**: NestJS requiere un módulo raíz que coordine todos los demás. Aquí se centraliza la configuración global y se declaran todas las dependencias.

#### `apps/api/src/modules/users/`

**Estructura**:
- `users.module.ts`: Módulo de usuarios
- `users.service.ts`: Lógica de negocio de usuarios
- `prisma.service.ts`: Servicio de Prisma (singleton)

**Justificación de la ubicación**:
- `prisma.service.ts` está aquí porque es compartido por todos los módulos que necesitan acceso a BD
- `users.service.ts` contiene métodos como `findByEmail()` y `createUser()` que son usados por AuthModule

**Dependencias**: Ninguna (módulo base)

#### `apps/api/src/modules/auth/`

**Estructura**:
- `auth.module.ts`: Módulo de autenticación
- `auth.controller.ts`: Endpoints `/auth/*`
- `auth.service.ts`: Lógica de autenticación (registro, login, validación)
- `jwt.guard.ts`: Guard para proteger rutas
- `jwt.strategy.ts`: Estrategia Passport para JWT

**Justificación**:
- Separación clara de responsabilidades: controlador maneja HTTP, servicio maneja lógica
- `jwt.guard.ts` y `jwt.strategy.ts` están aquí porque son específicos de autenticación
- El módulo importa `UsersModule` para acceder a `UsersService`

**Dependencias**: `UsersModule`

#### `apps/api/src/modules/groups/`

**Estructura**:
- `groups.module.ts`: Módulo de grupos
- `groups.controller.ts`: Endpoints `/groups/*`
- `groups.service.ts`: Lógica de grupos, miembros, invitaciones

**Justificación**:
- Agrupa toda la funcionalidad relacionada con grupos
- El servicio maneja operaciones complejas como transacciones (eliminar grupo con sus relaciones)
- Importa `PrismaService` para acceso a BD

**Dependencias**: `PrismaService` (a través de `UsersModule`)

#### `apps/api/src/modules/health/`

**Estructura**:
- `health.module.ts`: Módulo de salud
- `health.controller.ts`: Endpoint `GET /health`

**Justificación**: Endpoint simple para verificar que la API está funcionando. Útil para monitoreo y health checks en producción.

#### `apps/api/src/modules/landing/`

**Estructura**:
- `landing.module.ts`: Módulo de landing
- `landing.controller.ts`: Endpoint `GET /` (página HTML de bienvenida)

**Justificación**: Proporciona una página de bienvenida cuando se accede a la raíz de la API. Útil para desarrolladores que exploran la API.

#### `apps/api/prisma/schema.prisma`

**Ubicación**: `apps/api/prisma/schema.prisma`

**Responsabilidad**: Define el esquema de la base de datos.

**Justificación**: Prisma requiere el schema en `prisma/` para generar el cliente. Este archivo es la "fuente de verdad" del modelo de datos.

**Comandos relacionados**:
- `prisma generate`: Genera el cliente TypeScript
- `prisma migrate dev`: Crea migraciones
- `prisma db push`: Sincroniza schema con BD (desarrollo)

### Estructura del Frontend (`apps/web/`)

#### `apps/web/app/layout.tsx`

**Ubicación**: `apps/web/app/layout.tsx`

**Responsabilidad**: Layout raíz de la aplicación Next.js.

**Contenido**:
- Metadata de la página
- NavBar y Footer globales
- Estilos globales

**Justificación**: Next.js App Router requiere un `layout.tsx` en la raíz de `app/`. Este layout envuelve todas las páginas, proporcionando estructura común (navegación, footer).

#### `apps/web/app/page.tsx`

**Ubicación**: `apps/web/app/page.tsx`

**Responsabilidad**: Página principal (`/`).

**Justificación**: Next.js mapea `app/page.tsx` a la ruta `/`. Esta es la página de inicio de la aplicación.

#### `apps/web/app/login/page.tsx`

**Ubicación**: `apps/web/app/login/page.tsx`

**Responsabilidad**: Página de login y registro.

**Contenido**:
- Formulario de login/registro
- Toggle entre modos
- Guardado de token en `localStorage`
- Redirección a `/groups` tras éxito

**Justificación**: 
- Next.js mapea `app/login/page.tsx` a `/login`
- Es un Client Component porque necesita estado y eventos
- Maneja autenticación del lado del cliente

#### `apps/web/app/groups/page.tsx`

**Ubicación**: `apps/web/app/groups/page.tsx`

**Responsabilidad**: Hub de grupos (crear, listar, aceptar invitaciones).

**Contenido**:
- Formulario para crear grupo
- Lista de "mis grupos" con botones Entrar/Eliminar
- Lista de invitaciones pendientes con botón Aceptar
- Fetching de datos al montar el componente

**Justificación**:
- Página central después del login
- Agrupa toda la funcionalidad relacionada con grupos
- Client Component porque necesita fetching y estado

#### `apps/web/app/dashboard/page.tsx`

**Ubicación**: `apps/web/app/dashboard/page.tsx`

**Responsabilidad**: Dashboard principal del grupo.

**Contenido**:
- Sección de Gastos (componente placeholder)
- Sección de Tareas (componente placeholder)
- Panel de Miembros (lista + formulario de invitación)
- Fetching de miembros basado en `groupId` de la URL

**Justificación**:
- Recibe `groupId` como query parameter (`?groupId=xxx`)
- Es el "centro de mando" del grupo
- Estructura preparada para módulos futuros (Gastos, Tareas)

#### `apps/web/app/components/`

**Estructura**:
- `NavBar.tsx`: Barra de navegación
- `Gastos.tsx`: Componente placeholder para gastos
- `Tareas.tsx`: Componente placeholder para tareas

**Justificación**:
- Componentes reutilizables separados de las páginas
- `NavBar` se usa en el layout
- `Gastos` y `Tareas` son placeholders para funcionalidad futura

#### `apps/web/app/globals.css`

**Ubicación**: `apps/web/app/globals.css`

**Responsabilidad**: Estilos globales y configuración de Tailwind.

**Justificación**: Next.js requiere importar estilos globales en el layout. Tailwind se configura aquí.

---

## Requisitos Técnicos

### Requisitos del Sistema Operativo

1. **Sistema Operativo**: Windows 10/11, macOS 10.15+, o Linux (Ubuntu 20.04+)
2. **Arquitectura**: x64 (64-bit)
3. **Espacio en disco**: Mínimo 2GB libres (para node_modules y dependencias)
4. **Memoria RAM**: Mínimo 4GB recomendados (8GB para desarrollo cómodo)
5. **Permisos de administrador**: No requeridos para desarrollo (solo para instalación global de herramientas)

### Requisitos de Node.js y Gestores de Paquetes

6. **Node.js**: Versión >= 18.17.0 (recomendado 20.x LTS)
7. **npm**: Incluido con Node.js (no se usa directamente)
8. **pnpm**: Versión >= 9.0.0 (el proyecto especifica `pnpm@9.1.0`)
9. **Corepack**: Habilitado (viene con Node.js 16.9+) para gestionar pnpm automáticamente
10. **Gestión de versiones de Node**: Recomendado usar nvm (Node Version Manager) o fnm

### Requisitos de TypeScript

11. **TypeScript**: Versión 5.4.x (especificado en ambos proyectos)
12. **Configuración TypeScript**: `strict: true` recomendado
13. **Tipos de Node**: `@types/node` >= 20.x
14. **Tipos de React**: `@types/react` >= 18.x
15. **Tipos de Express**: `@types/express` >= 4.x

### Requisitos del Backend (NestJS)

16. **NestJS Core**: Versión 10.3.x
17. **NestJS CLI**: Versión 10.4.x (para scaffolding y builds)
18. **Express**: Versión incluida en `@nestjs/platform-express`
19. **Prisma**: Versión 5.19.x (cliente) y 5.22.x (CLI)
20. **Prisma Client**: Generado automáticamente con `prisma generate`
21. **SQLite**: Incluido en Node.js (no requiere instalación separada)
22. **bcrypt**: Versión 5.1.x (para cifrado de contraseñas)
23. **JWT**: `@nestjs/jwt` versión 10.2.x
24. **Passport**: Versión 0.7.x con estrategias JWT y Local
25. **class-validator**: Versión 0.14.x (validación de DTOs)
26. **class-transformer**: Versión 0.5.x (transformación de objetos)
27. **reflect-metadata**: Versión 0.2.x (requerido por NestJS)
28. **rxjs**: Versión 7.8.x (usado internamente por NestJS)

### Requisitos del Frontend (Next.js)

29. **Next.js**: Versión 14.2.x con App Router
30. **React**: Versión 18.3.x
31. **React DOM**: Versión 18.3.x
32. **Tailwind CSS**: Versión 3.4.x
33. **PostCSS**: Versión 8.4.x (requerido por Tailwind)
34. **Autoprefixer**: Versión 10.4.x (requerido por Tailwind)
35. **ESLint**: Versión 8.57.x con `eslint-config-next`

### Requisitos de Herramientas de Desarrollo

36. **Turborepo**: Versión 2.1.x (orquestación del monorepo)
37. **ESLint**: Versión 8.57.x (linting de código)
38. **TypeScript ESLint**: Plugin y parser versión 7.8.x
39. **Prettier**: Opcional pero recomendado (formateo de código)
40. **Husky**: Versión 9.1.x (git hooks, opcional)

### Requisitos de Red y Puertos

41. **Puerto 3000**: Debe estar libre (Next.js frontend)
42. **Puerto 3001**: Debe estar libre (NestJS backend)
43. **CORS**: Configurado para `http://localhost:3000`
44. **Protocolo HTTP**: HTTP/1.1 (HTTPS opcional en producción)

### Requisitos de Base de Datos

45. **SQLite**: Versión incluida en Node.js (desarrollo)
46. **Prisma Migrate**: Para gestionar migraciones de esquema
47. **Archivo de BD**: `apps/api/prisma/dev.db` (creado automáticamente)
48. **Permisos de escritura**: Necesarios en la carpeta `apps/api/prisma/`

### Requisitos del Navegador (Cliente)

49. **Navegadores soportados**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
50. **JavaScript**: Debe estar habilitado
51. **Cookies**: Habilitadas (para futuras implementaciones de sesión)
52. **LocalStorage**: Debe estar disponible (para almacenar tokens JWT)
53. **CORS**: El navegador debe permitir peticiones cross-origin (ya configurado en backend)

### Requisitos de Variables de Entorno

54. **JWT_SECRET**: Opcional (por defecto usa "dev-secret" en desarrollo)
55. **PORT**: Opcional (por defecto 3001 para API)
56. **DATABASE_URL**: No requerido (usa SQLite local por defecto)
57. **NODE_ENV**: Opcional (development por defecto)

### Requisitos de Git y Control de Versiones

58. **Git**: Versión >= 2.30.x
59. **Git LFS**: No requerido
60. **Permisos de escritura**: En el directorio del proyecto

### Requisitos Adicionales (Opcionales)

61. **Docker**: Para contenedorización (futuro)
62. **PostgreSQL**: Para producción (futuro, actualmente SQLite)
63. **Redis**: Para caché y sesiones (futuro)
64. **CI/CD**: GitHub Actions, GitLab CI, etc. (futuro)

---

## Instalación y Configuración

### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js 20.x LTS**: Descarga desde [nodejs.org](https://nodejs.org/)
2. **pnpm**: Se instalará automáticamente con Corepack (ver siguiente sección)

### Paso 1: Habilitar Corepack

Corepack viene incluido con Node.js 16.9+ y gestiona automáticamente pnpm.

**Windows (PowerShell como Administrador)**:
```powershell
corepack enable
```

**macOS/Linux**:
```bash
corepack enable
```

Si tienes problemas de permisos, puedes usar:
   ```powershell
corepack prepare pnpm@9.1.0 --activate
```

### Paso 2: Clonar el Repositorio

```bash
git clone https://github.com/TU_USUARIO/softwarePisosCompartidos.git
cd softwarePisosCompartidos
```

### Paso 3: Instalar Dependencias

Desde la raíz del proyecto:

```bash
   pnpm install
```

Este comando:
- Instala dependencias de todos los workspaces (`apps/api`, `apps/web`, raíz)
- Ejecuta `postinstall` hooks (genera Prisma Client)
- Crea `node_modules` en cada workspace

### Paso 4: Configurar la Base de Datos

#### Generar Prisma Client

```bash
cd apps/api
pnpm prisma:generate
```

O desde la raíz:
```bash
   pnpm -C apps/api prisma:generate
```

Este comando genera el cliente TypeScript de Prisma basándose en `prisma/schema.prisma`.

#### Crear la Base de Datos y Aplicar Migraciones

```bash
cd apps/api
pnpm prisma:migrate
```

O desde la raíz:
```bash
   pnpm -C apps/api prisma:migrate
   ```

Este comando:
- Crea el archivo `prisma/dev.db` (SQLite)
- Aplica todas las migraciones pendientes
- Crea las tablas: `User`, `Group`, `GroupMember`, `Invitation`

**Nota**: Si es la primera vez, Prisma te pedirá un nombre para la migración. Usa `init` o cualquier nombre descriptivo.

### Paso 5: Configurar Variables de Entorno (Opcional)

Crea un archivo `.env` en `apps/api/`:

```env
JWT_SECRET=tu-secreto-super-seguro-aqui
PORT=3001
DATABASE_URL=file:./prisma/dev.db
```

**Nota**: En desarrollo, estos valores tienen defaults, así que este paso es opcional.

### Paso 6: Iniciar los Servidores

Desde la raíz del proyecto:

```bash
   pnpm dev
   ```

Este comando (gracias a Turborepo):
- Inicia `apps/api` en modo watch (puerto 3001)
- Inicia `apps/web` en modo dev (puerto 3000)
- Ambos se ejecutan en paralelo

**Verificación**:
- API: Abre [http://localhost:3001](http://localhost:3001) - deberías ver la página de bienvenida
- Web: Abre [http://localhost:3000](http://localhost:3000) - deberías ver la página principal

### Comandos Útiles

#### Desde la Raíz

- `pnpm dev`: Inicia ambos servidores en desarrollo
- `pnpm build`: Construye ambos proyectos para producción
- `pnpm lint`: Ejecuta linters en ambos proyectos

#### Desde `apps/api/`

- `pnpm dev`: Inicia el servidor NestJS en modo watch
- `pnpm build`: Compila TypeScript a JavaScript
- `pnpm start`: Ejecuta la versión compilada
- `pnpm prisma:generate`: Regenera Prisma Client
- `pnpm prisma:migrate`: Crea y aplica migraciones
- `pnpm db:push`: Sincroniza schema con BD (sin migraciones)

#### Desde `apps/web/`

- `pnpm dev`: Inicia Next.js en modo desarrollo
- `pnpm build`: Construye la aplicación para producción
- `pnpm start`: Ejecuta la versión de producción
- `pnpm lint`: Ejecuta ESLint

### Solución de Problemas Comunes

#### Error: "Cannot find module '@prisma/client'"

**Causa**: Prisma Client no se ha generado.

**Solución**:
```bash
cd apps/api
pnpm prisma:generate
```

#### Error: "Foreign key constraint violated"

**Causa**: Intentas eliminar un grupo sin eliminar primero sus relaciones.

**Solución**: Ya está solucionado en el código. Si persiste, verifica que estás usando la última versión del código.

#### Error: "Port 3000 already in use"

**Causa**: Otro proceso está usando el puerto.

**Solución**:
- Windows: `netstat -ano | findstr :3000` y luego `taskkill /PID <PID> /F`
- macOS/Linux: `lsof -ti:3000 | xargs kill`

#### Error: "Prisma schema validation error"

**Causa**: El schema tiene errores de sintaxis o validación.

**Solución**: Verifica `apps/api/prisma/schema.prisma` y ejecuta `pnpm prisma format` para validar.

---

## Problemas Encontrados y Soluciones

### Problema 1: Errores de TypeScript con Prisma Client

**Síntoma**: 
```
error TS2339: Property 'group' does not exist on type 'PrismaService'
```

**Causa**: 
Prisma Client no se había generado después de añadir nuevos modelos (`Group`, `GroupMember`, `Invitation`) al schema.

**Solución**:
1. Ejecutar `pnpm prisma:generate` en `apps/api/`
2. Añadir `postinstall` script en `package.json` para generar automáticamente
3. Añadir `prisma generate` al inicio del script `dev` para asegurar que siempre esté actualizado

**Lección aprendida**: Siempre regenerar Prisma Client después de modificar el schema.

### Problema 2: SQLite no Soporta Enums

**Síntoma**:
```
Error: You defined the enum `InvitationStatus`. But the current connector does not support enums.
```

**Causa**: 
SQLite no soporta tipos ENUM nativos. Prisma requiere que uses `String` con valores literales.

**Solución**:
Cambiar de:
```prisma
enum InvitationStatus {
  PENDING
  ACCEPTED
  DECLINED
  EXPIRED
}
```

A:
```prisma
status String @default("PENDING")
```

Y manejar los valores como strings en el código TypeScript.

**Lección aprendida**: SQLite es limitado para desarrollo. En producción usar PostgreSQL que soporta enums.

### Problema 3: Relaciones Faltantes en Prisma Schema

**Síntoma**:
```
Error validating field `owner` in model `Group`: The relation field `owner` is missing an opposite relation field on the model `User`.
```

**Causa**: 
Prisma requiere que las relaciones bidireccionales estén definidas en ambos modelos.

**Solución**:
Añadir la relación inversa en el modelo `User`:
```prisma
model User {
  // ...
  ownedGroups Group[]
}
```

Y en `Group`:
```prisma
model Group {
  // ...
  invitations Invitation[]
}
```

**Lección aprendida**: Prisma requiere relaciones explícitas en ambos lados para mantener la integridad del modelo.

### Problema 4: Foreign Key Constraint al Eliminar Grupos

**Síntoma**:
```
Foreign key constraint violated: `foreign key`
```

**Causa**: 
Intentar eliminar un `Group` sin eliminar primero sus relaciones (`GroupMember`, `Invitation`).

**Solución**:
Usar una transacción de Prisma para eliminar en orden:
```typescript
await this.prisma.$transaction([
  this.prisma.invitation.deleteMany({ where: { groupId } }),
  this.prisma.groupMember.deleteMany({ where: { groupId } }),
  this.prisma.group.delete({ where: { id: groupId } }),
]);
```

**Lección aprendida**: Siempre eliminar relaciones dependientes antes de eliminar la entidad principal. Usar transacciones para atomicidad.

### Problema 5: CORS "Failed to fetch" en el Frontend

**Síntoma**: 
El navegador muestra "Failed to fetch" al intentar hacer peticiones al API.

**Causa**: 
- El servidor API no está corriendo
- CORS no está configurado correctamente
- El puerto es incorrecto

**Solución**:
1. Verificar que el API está corriendo en `http://localhost:3001`
2. Verificar que CORS permite `http://localhost:3000`
3. Verificar que las URLs en el frontend apuntan a `http://localhost:3001`

**Lección aprendida**: CORS es crítico en desarrollo. Siempre verificar configuración y que ambos servidores estén corriendo.

### Problema 6: Prisma Client no se Actualiza en Watch Mode

**Síntoma**: 
Cambios en el schema no se reflejan hasta reiniciar el servidor.

**Causa**: 
NestJS en modo watch no regenera Prisma Client automáticamente.

**Solución**:
Añadir `prisma generate` al inicio del script `dev`:
```json
"dev": "prisma generate --schema=prisma/schema.prisma && nest start --watch"
```

**Lección aprendida**: En desarrollo, regenerar Prisma Client antes de iniciar el servidor asegura que siempre esté sincronizado.

### Problema 7: PowerShell no Soporta `&&` en Comandos

**Síntoma**: 
```
El token '&&' no es un separador de instrucciones válido
```

**Causa**: 
PowerShell usa `;` en lugar de `&&` para encadenar comandos.

**Solución**:
Usar comandos separados o usar `;` en PowerShell:
```powershell
corepack enable pnpm; pnpm -v
```

O ejecutar comandos por separado.

**Lección aprendida**: Documentar comandos para múltiples shells (PowerShell, Bash, Zsh).

### Problema 8: Token JWT no se Persiste Correctamente

**Síntoma**: 
Usuario se autentica pero pierde la sesión al recargar.

**Causa**: 
Token se guarda en `localStorage` pero no se verifica al cargar la página.

**Solución**:
Añadir verificación de token en componentes que requieren autenticación:
```typescript
useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.replace("/login");
  }
}, []);
```

**Lección aprendida**: En el futuro, usar cookies HttpOnly para mayor seguridad y persistencia automática.

### Problema 9: TypeScript Errors con `as any` en Prisma

**Síntoma**: 
Necesidad de usar `(this.prisma as any).group` para evitar errores de tipo.

**Causa**: 
Prisma Client no se generaba correctamente o TypeScript no reconocía los tipos.

**Solución temporal**: 
Usar `as any` como workaround mientras se soluciona la generación de Prisma Client.

**Solución definitiva**: 
Asegurar que `prisma generate` se ejecuta correctamente y que los tipos están disponibles.

**Lección aprendida**: Los workarounds con `as any` son temporales. Siempre buscar la causa raíz.

### Problema 10: Grupos no Aparecen Después de Crearlos

**Síntoma**: 
Usuario crea un grupo pero no aparece en la lista.

**Causa**: 
El frontend no recarga la lista después de crear el grupo.

**Solución**:
Añadir fetching de la lista después de crear:
```typescript
const g = await res.json();
const list = await fetch("http://localhost:3001/groups/mine", {
  headers: { Authorization: `Bearer ${token}` }
});
if (list.ok) setMyGroups(await list.json());
```

**Lección aprendida**: Siempre actualizar el estado local después de mutaciones para mantener la UI sincronizada.

---

## Conclusión

Este proyecto representa una **base sólida y escalable** para una aplicación de gestión de pisos compartidos. Hemos implementado exitosamente:

### Logros Principales

1. **Arquitectura Robusta**: Monorepo bien estructurado con separación clara entre frontend y backend
2. **Autenticación Completa**: Sistema de registro, login y protección de rutas con JWT
3. **Gestión de Grupos**: CRUD completo de grupos con permisos (solo owner puede eliminar)
4. **Sistema de Invitaciones**: Flujo completo de invitaciones por correo electrónico
5. **Gestión de Miembros**: Listado y roles (owner/member) funcionales
6. **Persistencia de Datos**: Prisma ORM con SQLite, fácil migración a PostgreSQL
7. **UI Funcional**: Interfaz moderna con Tailwind CSS y navegación intuitiva

### Fortalezas del Proyecto

- **Escalabilidad**: La arquitectura modular permite añadir nuevos módulos (gastos, tareas) sin afectar código existente
- **Type Safety**: TypeScript en todo el stack previene errores en tiempo de compilación
- **Mantenibilidad**: Código organizado por módulos y responsabilidades claras
- **Developer Experience**: Hot reload, TypeScript, y herramientas modernas facilitan el desarrollo
- **Preparado para Producción**: Estructura lista para añadir tests, CI/CD, y despliegue

### Áreas de Mejora Futura

1. **Seguridad**: Implementar cookies HttpOnly, refresh tokens, y rate limiting
2. **Testing**: Añadir tests unitarios, de integración, y E2E
3. **Validación**: Validación más robusta en frontend y backend
4. **UX**: Mejoras en feedback visual, loading states, y manejo de errores
5. **Performance**: Optimización de queries, caché, y lazy loading
6. **Documentación API**: OpenAPI/Swagger para documentar endpoints
7. **Monitoreo**: Logging estructurado, métricas, y alertas

### Próximos Pasos Recomendados

1. **Módulo de Gastos**: Implementar creación de gastos, división entre miembros, y cálculo de saldos
2. **Módulo de Tareas**: Sistema de tareas con rotación automática y recordatorios
3. **Notificaciones**: Email y push notifications para eventos importantes
4. **Reportes**: Historial de gastos, gráficos, y exportación de datos
5. **Producción**: Migrar a PostgreSQL, añadir CI/CD, y desplegar en cloud

### Reflexión Final

Este proyecto demuestra una **arquitectura profesional y bien pensada** que balancea simplicidad con escalabilidad. El uso de tecnologías modernas (Next.js 14, NestJS 10, Prisma) y mejores prácticas (monorepo, TypeScript, separación de responsabilidades) proporciona una base excelente para construir una aplicación completa y robusta.

La documentación extensa aquí presentada debería servir como guía para cualquier desarrollador que se una al proyecto, facilitando la comprensión del sistema y acelerando el desarrollo de nuevas funcionalidades.

---

**Versión del Documento**: 1.0  
**Última Actualización**: Noviembre 2025  
**Mantenido por**: Equipo de Desarrollo
