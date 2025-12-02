## Objetivo
- Instalar dependências e subir frontend (Vite) e backend (Express/Apollo) em paralelo usando Turborepo.
- Garantir que Prisma tenha o cliente gerado e variáveis de ambiente estejam presentes.

## Preparação
- Habilitar Corepack (se ainda não foi):
  - `corepack enable`
- Instalar dependências de todos os workspaces:
  - `yarn install`
- Criar `.env` do backend com variáveis mínimas (usando o exemplo existente):
  - `Copy-Item apps/backend/.env.example apps/backend/.env`
- Gerar cliente Prisma no backend:
  - `yarn workspace @portfolio/backend db:generate`

## Execução
- Subir os servidores de desenvolvimento em paralelo via Turborepo:
  - `yarn dev`
- Endpoints esperados:
  - Frontend: `http://localhost:5173/`
  - Backend (Auth): `http://localhost:4000/api/auth/login`
  - Backend (GraphQL): `http://localhost:4000/graphql`

## Verificação Rápida
- Login de teste (usuário admin):
  - Corpo: `{ "email": "admin", "password": "admin" }`
  - Resposta esperada: token JWT e dados do usuário
- GraphQL está acessível na rota `/graphql` (schema inicial com resolvers mockados).

## Observações
- Prisma não precisa conectar ao banco para `generate`, mas exige `DATABASE_URL` definido no `.env`.
- Se quiser alterar `PORT` do backend ou `DATABASE_URL`, edite `apps/backend/.env` antes do `yarn dev`. 