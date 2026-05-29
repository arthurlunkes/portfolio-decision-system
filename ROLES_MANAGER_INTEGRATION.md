# 🚀 Integração do Gerenciador de Papéis

Instruções técnicas para adicionar o RolesManager ao sistema completo.

---

## 📋 Checklist de Integração

- [ ] Adicionar rota `/roles` ao router
- [ ] Adicionar link à navegação (header/sidebar)
- [ ] Implementar backend (models + resolvers)
- [ ] Testar CRUD completo
- [ ] Testar permissões (apenas ADMIN)

---

## 1️⃣ Router - `apps/frontend/src/router/index.ts`

### Adicionar import

```typescript
import RolesManager from '@/pages/RolesManager.vue'
```

### Adicionar rota

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ... outras rotas ...
    
    {
      path: '/roles',
      name: 'RolesManager',
      component: RolesManager,
      meta: {
        requiresAuth: true,
        requiredRoles: ['ADMIN'],
        title: 'Gerenciador de Papéis',
      },
    },
    
    // ... resto ...
  ]
})
```

---

## 2️⃣ Navegação - `apps/frontend/src/components/layout/AppHeader.vue`

Adicionar link no menu ou dropdown de admin:

```vue
<template>
  <!-- ... header existente ... -->
  
  <nav v-if="isAdmin" class="space-y-1">
    <!-- Outras opções de admin -->
    
    <RouterLink
      to="/roles"
      active-class="bg-primary-100 text-primary-600"
      class="px-4 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10h.01M12 10h.01M9 10h.01" />
      </svg>
      <span>Gerenciar Papéis</span>
    </RouterLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.role === 'ADMIN')
</script>
```

---

## 3️⃣ Backend - Prisma Schema

### Adicionar models

`apps/backend/prisma/schema.prisma`

```prisma
// Papel customizável
model Role {
  id            String            @id @default(cuid())
  name          String            @unique
  label         String
  description   String            @default("")
  isSystem      Boolean           @default(false)
  permissions   RolePermission[]
  users         User[]            @relation("CustomRole")
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
}

// Permissão individual (muitos-para-muitos com Role)
model RolePermission {
  id        String   @id @default(cuid())
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  roleId    String
  resource  String   // Resource enum serializado: PROJECTS, CRITERIA, etc
  action    String   // Action enum serializado: CREATE, READ, etc
  createdAt DateTime @default(now())

  @@unique([roleId, resource, action])
}

// Atualizar User model
model User {
  // ... campos existentes ...
  
  // Remover isso se existir:
  // role UserRole @default(DECISOR)
  
  // Adicionar isso:
  customRole      Role?     @relation("CustomRole", fields: [customRoleId], references: [id])
  customRoleId    String?
  
  // Ou se for usar sistema de papéis dinâmicos:
  roleId          String?   // Para novo sistema
  
  // ... resto ...
}
```

### Criar migration

```bash
# No diretório apps/backend
npx prisma migrate dev --name add_custom_roles

# Ou:
npx prisma generate
```

---

## 4️⃣ Backend - Seed Initial Roles

`apps/backend/prisma/seed.ts`

```typescript
// Seed de papéis iniciais
async function seedRoles() {
  console.log('Seeding system roles...')

  const roles = [
    {
      name: 'ADMIN',
      label: 'Administrador',
      description: 'Acesso total ao sistema',
      isSystem: true,
      permissions: [
        { resource: 'PROJECTS', action: 'CREATE' },
        { resource: 'PROJECTS', action: 'READ' },
        { resource: 'PROJECTS', action: 'UPDATE' },
        { resource: 'PROJECTS', action: 'DELETE' },
        // ... todas as permissões ...
      ],
    },
    {
      name: 'DECISOR',
      label: 'Decisor',
      description: 'Criar e gerenciar projetos',
      isSystem: true,
      permissions: [
        { resource: 'PROJECTS', action: 'CREATE' },
        { resource: 'PROJECTS', action: 'READ' },
        // ... permissões do decisor ...
      ],
    },
    // ... outros papéis ...
  ]

  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: {
        name: roleData.name,
        label: roleData.label,
        description: roleData.description,
        isSystem: roleData.isSystem,
        permissions: {
          create: roleData.permissions,
        },
      },
    })
  }
}
```

---

## 5️⃣ Backend - GraphQL Types

`apps/backend/src/modules/roles/types.ts` (novo arquivo)

```typescript
export interface RolePermission {
  resource: string
  action: string
}

export interface CustomRole {
  id: string
  name: string
  label: string
  description: string
  permissions: RolePermission[]
  isSystem: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateRoleInput {
  name: string
  label: string
  description: string
  permissions: RolePermission[]
}

export interface UpdateRoleInput {
  label?: string
  description?: string
  permissions?: RolePermission[]
}
```

---

## 6️⃣ Backend - GraphQL Resolvers

`apps/backend/src/modules/roles/resolvers.ts` (novo arquivo)

```typescript
import { verifyPermission, requireAdmin } from '@/modules/permissions/guards'
import type { GraphQLContext } from '@/context'
import { Resource, Action } from '@/modules/permissions/types'
import { prisma } from '@/lib/prisma'

export const roleResolvers = {
  Query: {
    async allRoles(_: any, __: any, context: GraphQLContext) {
      // Pode ser público ou restrito
      return await prisma.role.findMany({
        include: { permissions: true },
        orderBy: { name: 'asc' },
      })
    },

    async role(_: any, { id }: { id: string }, context: GraphQLContext) {
      return await prisma.role.findUnique({
        where: { id },
        include: { permissions: true },
      })
    },

    async availablePermissions() {
      // Retornar recursos e ações disponíveis
      return {
        resources: ['PROJECTS', 'CRITERIA', 'EVALUATIONS', 'RESULTS', 'USERS', 'PERMISSIONS'],
        actions: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'EXPORT', 'VIEW_RESULTS', 'MANAGE_USERS', 'MANAGE_PERMISSIONS'],
        actionLabels: {
          CREATE: 'Criar',
          READ: 'Ler',
          UPDATE: 'Atualizar',
          DELETE: 'Deletar',
          EXPORT: 'Exportar',
          VIEW_RESULTS: 'Ver Resultados',
          MANAGE_USERS: 'Gerenciar Usuários',
          MANAGE_PERMISSIONS: 'Gerenciar Permissões',
        },
        resourceLabels: {
          PROJECTS: 'Projetos',
          CRITERIA: 'Critérios',
          EVALUATIONS: 'Avaliações',
          RESULTS: 'Resultados',
          USERS: 'Usuários',
          PERMISSIONS: 'Permissões',
        },
      }
    },
  },

  Mutation: {
    async createRole(
      _: any,
      { input }: { input: CreateRoleInput },
      context: GraphQLContext
    ) {
      // Verificar permissão
      verifyPermission(context, Resource.PERMISSIONS, Action.MANAGE_PERMISSIONS)

      // Validações
      if (!input.name || !input.label) {
        throw new Error('Nome e rótulo são obrigatórios')
      }

      // Verificar se nome já existe
      const existing = await prisma.role.findUnique({
        where: { name: input.name },
      })
      if (existing) {
        throw new Error('Papel com este nome já existe')
      }

      // Criar
      return await prisma.role.create({
        data: {
          name: input.name,
          label: input.label,
          description: input.description || '',
          isSystem: false,
          permissions: {
            create: input.permissions.map((p) => ({
              resource: p.resource,
              action: p.action,
            })),
          },
        },
        include: { permissions: true },
      })
    },

    async updateRole(
      _: any,
      { id, input }: { id: string; input: UpdateRoleInput },
      context: GraphQLContext
    ) {
      verifyPermission(context, Resource.PERMISSIONS, Action.MANAGE_PERMISSIONS)

      const role = await prisma.role.findUnique({ where: { id } })
      if (!role) throw new Error('Papel não encontrado')

      // Não permitir editar papéis do sistema
      // (ou permitir mas com cuidado)

      // Deletar permissões antigas
      if (input.permissions) {
        await prisma.rolePermission.deleteMany({ where: { roleId: id } })
      }

      // Atualizar
      return await prisma.role.update({
        where: { id },
        data: {
          label: input.label,
          description: input.description,
          permissions: input.permissions
            ? {
                create: input.permissions.map((p) => ({
                  resource: p.resource,
                  action: p.action,
                })),
              }
            : undefined,
        },
        include: { permissions: true },
      })
    },

    async deleteRole(_: any, { id }: { id: string }, context: GraphQLContext) {
      verifyPermission(context, Resource.PERMISSIONS, Action.MANAGE_PERMISSIONS)

      const role = await prisma.role.findUnique({ where: { id } })
      if (!role) throw new Error('Papel não encontrado')

      // Não permitir deletar papéis do sistema
      if (role.isSystem) {
        throw new Error('Não é permitido deletar papéis do sistema')
      }

      // Remover papel dos usuários
      await prisma.user.updateMany({
        where: { customRoleId: id },
        data: { customRoleId: null },
      })

      // Deletar
      await prisma.role.delete({ where: { id } })
      return true
    },

    async cloneRole(
      _: any,
      { id, newName }: { id: string; newName: string },
      context: GraphQLContext
    ) {
      verifyPermission(context, Resource.PERMISSIONS, Action.MANAGE_PERMISSIONS)

      const role = await prisma.role.findUnique({
        where: { id },
        include: { permissions: true },
      })
      if (!role) throw new Error('Papel não encontrado')

      return await prisma.role.create({
        data: {
          name: newName,
          label: `${role.label} (Cópia)`,
          description: role.description,
          isSystem: false,
          permissions: {
            create: role.permissions.map((p) => ({
              resource: p.resource,
              action: p.action,
            })),
          },
        },
        include: { permissions: true },
      })
    },
  },
}
```

---

## 7️⃣ GraphQL Schema

Adicionar ao schema GraphQL:

```graphql
type Role {
  id: ID!
  name: String!
  label: String!
  description: String!
  permissions: [RolePermission!]!
  isSystem: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type RolePermission {
  resource: String!
  action: String!
}

input CreateRoleInput {
  name: String!
  label: String!
  description: String
  permissions: [RolePermissionInput!]!
}

input UpdateRoleInput {
  label: String
  description: String
  permissions: [RolePermissionInput!]
}

input RolePermissionInput {
  resource: String!
  action: String!
}

type AvailablePermissions {
  resources: [String!]!
  actions: [String!]!
  actionLabels: [String!]!
  resourceLabels: [String!]!
}

extend type Query {
  allRoles: [Role!]!
  role(id: ID!): Role
  availablePermissions: AvailablePermissions!
}

extend type Mutation {
  createRole(input: CreateRoleInput!): Role!
  updateRole(id: ID!, input: UpdateRoleInput!): Role!
  deleteRole(id: ID!): Boolean!
  cloneRole(id: ID!, newName: String!): Role!
}
```

---

## ✅ Testar

```bash
# 1. Migração do banco
cd apps/backend
npx prisma migrate dev

# 2. Seed de dados iniciais
npx prisma db seed

# 3. Iniciar backend
npm run dev

# 4. Iniciar frontend
cd apps/frontend
npm run dev

# 5. Navegar para
# http://localhost:5173/roles
```

---

## 🔍 Debug

### Verificar banco de dados

```bash
cd apps/backend
npx prisma studio
# Abre GUI em http://localhost:5555
```

### Ver queries GraphQL

```
# Frontend F12 → Network → Filter by "graphql"
# Ou usar Apollo DevTools
```

---

## 📊 Status de Implementação

| Componente | Status |
|------------|--------|
| Frontend UI | ✅ PRONTO |
| API Service | ✅ PRONTO |
| Backend Models | 🟡 PARTIAL (precisa schema) |
| Backend Resolvers | 🟡 PARTIAL (precisa implementar) |
| Router | 🟡 PARTIAL (precisa adicionar) |
| Navegação | 🟡 PARTIAL (precisa adicionar) |

---

**Pronto para integrar! 🚀**
