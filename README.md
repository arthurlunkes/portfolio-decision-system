# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

## Docker

Para subir o projeto completo (frontend + backend + PostgreSQL):

```bash
docker compose up --build -d
```

Servicos e portas:

- Frontend: http://localhost:8080
- Backend: http://localhost:4000/graphql
- PostgreSQL: localhost:5432

Para acompanhar logs:

```bash
docker compose logs -f
```

Para parar tudo:

```bash
docker compose down
```

## Banco de Dados (Migrations e Seed)

No backend, o Prisma agora usa migration versionada e seed idempotente.

Comandos principais:

```bash
yarn workspace @portfolio/backend db:migrate
yarn workspace @portfolio/backend db:migrate:deploy
yarn workspace @portfolio/backend db:seed
```

No Docker, o entrypoint do backend executa automaticamente `prisma migrate deploy` e `prisma db seed` antes de iniciar a API.
