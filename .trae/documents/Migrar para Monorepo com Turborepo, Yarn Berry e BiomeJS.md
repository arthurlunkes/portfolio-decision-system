## Objetivo
- Reorganizar o repositório em monorepo com Yarn Berry (workspaces) e Turborepo.
- Estrutura: `apps/backend`, `apps/frontend`, `packages/shared` (e futuros pacotes compartilhados).
- Configurar BiomeJS para lint/format unificado em todo o monorepo.

## Estrutura Final
- `/apps/backend` → código atual da pasta `api` (Express + Prisma + TS).
- `/apps/frontend` → código atual do root (Vite + Vue 3 + TS + Tailwind).
- `/packages/shared` → tipos/utilitários compartilhados entre front e back.
- Arquivos de orquestração na raiz: `package.json`, `.yarnrc.yml`, `turbo.json`, `tsconfig.base.json`, `biome.json`, `.yarn/**`.

## Passos Principais
1. Criar configuração de Yarn Berry no root, habilitando workspaces e usando `nodeLinker: node-modules` para compatibilidade (Prisma/Vite).
2. Instalar Turborepo no root e definir `turbo.json` com pipelines (`dev`, `build`, `lint`, `format`, `test`).
3. Mover a pasta `api/` para `apps/backend/` e ajustar `package.json` (nome, scripts mantidos).
4. Mover o front do root para `apps/frontend/` e ajustar `package.json` (nome, scripts, dependências mantidas).
5. Criar `packages/shared` com `package.json`, `tsconfig.json` e `src/index.ts` para exportar tipos/utilitários (ex.: entidades de domínio usadas no front).
6. Introduzir `tsconfig.base.json` no root e fazer `extends` nos projetos; adicionar `paths` e usar import de pacote (`@portfolio/shared`).
7. Configurar BiomeJS no root com `biome.json` (formatter+linter), e scripts de `lint`/`format` em cada app e no root via Turborepo.
8. Atualizar `vite.config.ts` apenas se necessário (aliases) — preferir import pelo nome do pacote workspace.
9. Garantir `.env` e Prisma dentro de `apps/backend` (scripts `db:*` continuam a funcionar) e atualizar `.gitignore` se preciso.

## Arquivos no Root
### package.json (root)
```json
{
  "name": "portfolio-decision-system",
  "private": true,
  "packageManager": "yarn@4.x",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "format": "turbo run format",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "@biomejs/biome": "^1.6.0",
    "typescript": "^5.9.0"
  }
}
```

### .yarnrc.yml
```yml
nodeLinker: node-modules

# (Opcional) plugins úteis: constraints, interactive-tools
# plugins:
#   - path: .yarn/plugins/@yarnpkg/plugin-interactive-tools.cjs
```

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": { "outputs": [] },
    "format": { "outputs": [] },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    }
  }
}
```

### tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@portfolio/shared": ["packages/shared/src/index.ts"],
      "@portfolio/shared/*": ["packages/shared/src/*"]
    },
    "types": ["node"]
  }
}
```

### biome.json
```json
{
  "$schema": "https://biomejs.dev/schemas/1.6.0/schema.json",
  "formatter": { "enabled": true },
  "linter": { "enabled": true },
  "files": {
    "ignore": ["**/dist/**", "**/.yarn/**", "**/node_modules/**"]
  }
}
```

## apps/backend
- Mover conteúdo de `api/` para `apps/backend/` mantendo estrutura (`prisma/`, `src/`, etc.).
- Atualizar `apps/backend/package.json`:
  - `name`: `"@portfolio/backend"`.
  - Scripts originais: `dev`, `build`, `start`, `db:*`, `test`.
  - Adicionar scripts de lint/format: `"lint": "biome check ."`, `"format": "biome format --write ."`.
- `tsconfig.json` passa a `extends: ../../tsconfig.base.json` e mantém `outDir: "dist"`.
- `.env` permanece em `apps/backend/.env` (não versionar). Prisma continuará lendo daí.

## apps/frontend
- Mover todo conteúdo do root (Vite/Vue) para `apps/frontend/`.
- Atualizar `apps/frontend/package.json`:
  - `name`: `"@portfolio/frontend"`.
  - Scripts originais: `dev`, `build`, `preview`.
  - Adicionar scripts de lint/format: `"lint": "biome check ."`, `"format": "biome format --write ."`.
- `tsconfig.app.json`/`tsconfig.json` passam a `extends: ../../tsconfig.base.json`.
- Preferir import de tipos via pacote `@portfolio/shared`; se necessário, ajustar `vite.config.ts` para reconhecer o workspace.

## packages/shared
- Criar `packages/shared/package.json`:
```json
{
  "name": "@portfolio/shared",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "dev": "tsc -w -p tsconfig.json",
    "lint": "biome check .",
    "format": "biome format --write ."
  },
  "devDependencies": { "typescript": "^5.9.0" }
}
```
- `packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "declaration": true, "outDir": "dist" },
  "include": ["src"]
}
```
- `packages/shared/src/index.ts`: exportar interfaces/tipos que o front consome (ex.: `Project`, `Evaluation`, etc.).
- Ajustar imports no front para usar `@portfolio/shared` (sem paths relativos).

## Scripts de Trabalho
- `yarn dev` (root): roda `dev` em `apps/frontend` e `apps/backend` em paralelo.
- `yarn build`: build de todos os workspaces com cache do Turbo.
- `yarn lint` / `yarn format`: Biome em todos os pacotes via Turbo.
- `yarn test`: roda testes (Vitest no backend; futuro para o front).

## Notas e Compatibilidade
- Yarn Berry com `nodeLinker: node-modules` evita problemas de PnP com Prisma, Vite e plugins.
- BiomeJS hoje cobre TS/JS/JSON/CSS/MD muito bem; suporte direto a `.vue` é limitado. Manteremos o Biome para o que cobre e, se necessário, preservar formatação de `.vue` pelo Vite/Prettier existente. Podemos adicionar Prettier apenas para `.vue` se você quiser.
- Turborepo usa cache incremental; pipelines definidas consideram `dist/**` como output para melhor performance.

## Resultado Esperado
- Monorepo limpo com desenvolvimento paralelo de front/back, compartilhamento real de tipos/utilitários e lint/format padronizados com Biome.
- Zero duplicação de código compartilhado e base para futuros pacotes em `packages/`.