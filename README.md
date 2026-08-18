# BTW One CRM — Plataforma de Gestión de Relaciones con Clientes (Personalización de Twenty CRM)

> **Repositorio GitHub:** `https://github.com/Tupap1/btwonecrm`  
> **Visibilidad:** Public  
> **Upstream Oficial:** `https://github.com/twentyhq/twenty`  
> **Carpeta Local:** `C:\Proyectos\twentybtw`  
> **Estado:** Producción / Fork Activo y Personalizado con Pipeline CD en Docker Hub  

> [!NOTE]
> **Aviso de Origen Open-Source:** Este proyecto es una personalización (*fork*) y despliegue empresarial basado en el proyecto de código abierto **[Twenty CRM](https://twenty.com)** (`twentyhq/twenty`). No es una solución desarrollada al 100% desde cero, sino una adaptación adaptada a las necesidades operativas de BTW Inc., con flujos de integración continua, configuración de agentes y empaquetado para despliegue productivo.

---

## Overview

**BTW One CRM** proporciona un sistema CRM moderno, flexible y de alto rendimiento para la gestión de leads comerciales, embudos de ventas, seguimiento de cuentas clave, automatización de tareas y atención a clientes de BTW Inc. 

Resuelve la dependencia de plataformas CRM comerciales costosas mediante una infraestructura propia y extensible construida sobre la arquitectura empresarial de Twenty.

---

## Architecture

Monorepo empresarial gobernado por **Nx Workspace** con arquitectura desacoplada:

```
 ┌────────────────────────────────────────────────────────┐
 │                    Twenty Front (React)                │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │  React 19 + TypeScript + Twenty UI + Emotion     │  │
 │  │  Vistas Kanban, Tablas Dinámicas, Formularios    │  │
 │  └──────────────────────────┬───────────────────────┘  │
 └─────────────────────────────┼──────────────────────────┘
                               │ GraphQL API / WebSockets
                               ▼
 ┌────────────────────────────────────────────────────────┐
 │                   Twenty Server (NestJS)               │
 │  ┌──────────────────────────────────────────────────┐  │
 │  │  NestJS + TypeORM + GraphQL Subscriptions        │  │
 │  │  - Motor de Metadata Dinámica (Objetos y Campos) │  │
 │  │  - Motor de Workflows y Acciones de Agentes IA   │  │
 │  │  - Autenticación Multi-Workspace                 │  │
 │  └──────────────────────────┬───────────────────────┘  │
 └─────────────────────────────┼──────────────────────────┘
                               ▼
 ┌────────────────────────────────────────────────────────┐
 │             PostgreSQL + Redis (Worker Queues)         │
 └────────────────────────────────────────────────────────┘
```

### Decisiones de Diseño y Personalizaciones Clave:
1. **Pipeline de CD en Docker Hub:** Integración de flujos de GitHub Actions (`commit 449c2bd790`) para compilar y publicar imágenes Docker optimizadas automáticamente.
2. **Sistema de Metadatos Dinámicos:** Capacidad de crear campos y objetos personalizados en tiempo de ejecución sin modificar el esquema estático de base de datos.
3. **Módulos de Integración con Agentes IA:** Soporte para triggers de automatización y llamadas a modelos de lenguaje (Claude / Gemini) documentadas en `PRODUCT.md` y `CLAUDE.md`.

---

## Tech Stack

### Dependencias Principales Confirmadas (Monorepo Nx)
- **Monorepo Engine:** Nx Workspace `^19.0.0`, Yarn Berry (v4)
- **Backend API (`packages/twenty-server`):**
  - Framework: NestJS `^10.0.0`
  - Base de Datos & ORM: TypeORM, PostgreSQL 15+, Redis (BullMQ para colas de trabajo)
  - API Layer: GraphQL (Apollo Server / Mercurius), REST
- **Frontend UI (`packages/twenty-front`):**
  - Framework: React `^19.0.0`, Vite
  - Componentes: `@twenty-ui`, Emotion / CSS Variables
- **DevOps & CI/CD:** GitHub Actions, Docker multi-stage, Docker Hub

---

## Key Features

- **Gestión Integral de Oportunidades y Leads:** Tableros Kanban de ventas con etapas configurables y proyecciones de ingresos.
- **Directorio de Empresas y Contactos:** Registro centralizado con historial de interacciones, correos vinculados y notas.
- **Campos Personalizados sin Código:** Creación dinámica de propiedades (texto, número, select, relación) desde la interfaz de usuario.
- **Automatización de Flujos de Trabajo (Workflows):** Triggers automáticos por cambios en registros o eventos programados.
- **Despliegue Productivo Automatizado:** Pipeline de entrega continua que construye y despliega contenedores Docker.

---

## Setup & Run

### Requisitos Previos
- Node.js `20+`
- Yarn `^4.0.0` (Corepack habilitado)
- Docker Desktop (para PostgreSQL y Redis)

### Instalación de Dependencias
```bash
corepack enable
yarn install
```

### Levantar Servicios de Base de Datos
```bash
docker compose up -d
```

### Iniciar en Desarrollo
```bash
# Iniciar servidor backend y frontend concurrentemente con Nx
npx nx run-many --target=start --all
```

---

## Status

- **Fase Actual:** Producción / Fork personalizado desplegado.
- **Evidencia en Código:** Historial de commits en GitHub (`Tupap1/btwonecrm`), pipeline de CD configurado para Docker Hub, documentación de diseño en `DESIGN.md` y `PRODUCT.md`.
