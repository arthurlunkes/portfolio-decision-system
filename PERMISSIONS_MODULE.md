# Módulo de Permissões

Sistema robusto e escalável de permissões baseado em **Role-Based Access Control (RBAC)** para o Portfolio Decision System.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Roles e Permissões](#roles-e-permissões)
- [Backend](#backend)
- [Frontend](#frontend)
- [Exemplos](#exemplos)
- [Melhores Práticas](#melhores-práticas)

## 🎯 Visão Geral

O módulo de permissões fornece:

- **Sistema RBAC**: Baseado em 4 roles principais (Admin, Decisor, Analyst, Viewer)
- **Granular**: Controla o que cada role pode fazer em cada recurso (Create, Read, Update, Delete, Export)
- **Backend & Frontend**: Implementação em ambas as camadas para máxima segurança
- **Escalável**: Fácil adicionar novos recursos, ações e roles

### Componentes

```
permissions/
├── types/               # Enums e interfaces
├── policies/            # Definições de roles e permissões
├── services/            # Lógica de verificação
├── guards/              # Middleware para GraphQL
└── examples.ts          # Exemplos de uso
```

## 🏗️ Arquitetura

### Fluxo de Autorização

```
Requisição
    ↓
Verificação de Token JWT
    ↓
Extração de Role do Usuário
    ↓
Verificação de Permissão (RBAC)
    ↓
Execução da Ação
    ↓
Resposta
```

### Componentes Principais

#### 1. **Types** (`types/index.ts`)

Define os enums e interfaces base:

```typescript
enum Resource {
  PROJECTS = 'PROJECTS',
  CRITERIA = 'CRITERIA',
  EVALUATIONS = 'EVALUATIONS',
  RESULTS = 'RESULTS',
  USERS = 'USERS',
  PERMISSIONS = 'PERMISSIONS',
}

enum Action {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  VIEW_RESULTS = 'VIEW_RESULTS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_PERMISSIONS = 'MANAGE_PERMISSIONS',
}

enum UserRole {
  ADMIN = 'ADMIN',
  DECISOR = 'DECISOR',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}
```

#### 2. **Policies** (`policies/rbac.policies.ts`)

Define as permissões de cada role:

```typescript
ROLE_PERMISSIONS = {
  ADMIN: [ /* todas as permissões */ ],
  DECISOR: [ /* create, read, update, export */ ],
  ANALYST: [ /* read, create avaliações, view resultados */ ],
  VIEWER: [ /* apenas read */ ]
}
```

#### 3. **Service** (`services/permission.service.ts`)

Lógica de verificação:

```typescript
PermissionService.checkPermission(context, resource, action)
PermissionService.canCreate(context, resource)
PermissionService.isAdmin(context)
```

#### 4. **Guards** (`guards/permission.guard.ts`)

Middleware para GraphQL:

```typescript
verifyPermission(context, Resource.PROJECTS, Action.CREATE)
requireAuth(context)
requireAdmin(context)
requireRole([UserRole.ADMIN, UserRole.DECISOR])(context)
```

## 👥 Roles e Permissões

### ADMIN (Administrador)

**Descrição**: Acesso total a todos os recursos

**Permissões**:

- **Projetos**: Create, Read, Update, Delete, Export
- **Critérios**: Create, Read, Update, Delete
- **Avaliações**: Create, Read, Update, Delete
- **Resultados**: View Results, Export
- **Usuários**: Read, Create, Update, Delete, Manage
- **Permissões**: Manage

### DECISOR (Tomador de Decisão)

**Descrição**: Pode criar e gerenciar projetos, critérios e avaliações

**Permissões**:

- **Projetos**: Create, Read, Update, Export
- **Critérios**: Create, Read, Update
- **Avaliações**: Create, Read, Update
- **Resultados**: View Results, Export

### ANALYST (Analista)

**Descrição**: Pode visualizar projetos e criar avaliações, mas não modificar projetos

**Permissões**:

- **Projetos**: Read
- **Critérios**: Read
- **Avaliações**: Create, Read, Update
- **Resultados**: View Results, Export

### VIEWER (Visualizador)

**Descrição**: Acesso de leitura a projetos e resultados

**Permissões**:

- **Projetos**: Read
- **Critérios**: Read
- **Avaliações**: Read
- **Resultados**: View Results, Export

## 🔧 Backend

### Instalação no Backend

1. **Importar o módulo** em `src/index.ts`:

```typescript
import {
  PermissionService,
  Action,
  Resource,
  verifyPermission,
  requireAuth,
  requireAdmin,
} from './modules/permissions/index.js';
```

2. **Adicionar ao contexto GraphQL**:

```typescript
const contextValue = ({ req }: any) => ({
  user: req.user, // Decodificado do JWT
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextValue,
});
```

### Uso em Resolvers

#### Exemplo 1: Verificar permissão simples

```typescript
Mutation: {
  createProject: async (_: any, args: any, context: GraphQLContext) => {
    verifyPermission(context, Resource.PROJECTS, Action.CREATE);

    return await prisma.project.create({
      data: { name: args.name, description: args.description },
    });
  },
}
```

#### Exemplo 2: Verificar múltiplas permissões

```typescript
async function complexOperation(context: GraphQLContext) {
  const result = PermissionService.checkPermissions(context.user, [
    { resource: Resource.PROJECTS, action: Action.READ },
    { resource: Resource.EVALUATIONS, action: Action.CREATE },
  ]);

  if (!result.granted) {
    throw new Error(`Forbidden: ${result.reason}`);
  }
}
```

#### Exemplo 3: Verificações customizadas

```typescript
Query: {
  users: async (_: any, __: any, context: GraphQLContext) => {
    // Apenas admins podem listar usuários
    requireAdmin(context);
    return await prisma.user.findMany();
  },

  me: async (_: any, __: any, context: GraphQLContext) => {
    // Qualquer usuário autenticado
    const permContext = requireAuth(context);
    return await prisma.user.findUnique({ where: { id: permContext.userId } });
  },
}
```

#### Exemplo 4: Verificação inline

```typescript
updateUser: async (_: any, args: { id: string }, context: GraphQLContext) => {
  // Admin pode editar qualquer um, outros editam apenas a si mesmos
  if (context.user?.role !== 'ADMIN' && args.id !== context.user?.id) {
    throw new Error('Forbidden: Can only update your own profile');
  }

  return await prisma.user.update({
    where: { id: args.id },
    data: args.data,
  });
}
```

## 🎨 Frontend

### Instalação no Frontend

1. **Composables estão em** `src/composables/`:
   - `usePermissions.ts` - Principal
   - `usePermissionUI.ts` - Para UI components
   - `useRoutePermissions.ts` - Para route guards

2. **Inicializar após login**:

```typescript
// No serviço de autenticação
const { initializePermissions } = usePermissions();

const handleLoginSuccess = (user: any) => {
  initializePermissions(user.role, user.id, user.email);
};
```

### Composable: `usePermissions`

Verificação de permissões principal:

```typescript
const { can, canCreate, canRead, canUpdate, canDelete, canExport, isAdmin, permissions } = usePermissions();

// Verificações básicas
can(Resource.PROJECTS, Action.CREATE)  // true/false
canCreate(Resource.PROJECTS)           // true/false
canRead(Resource.CRITERIA)             // true/false
isAdmin.value                          // true/false

// Inicializar/limpar
initializePermissions(UserRole.DECISOR, 'user-id', 'user@email.com')
clearPermissions()
```

### Composable: `usePermissionUI`

Para elementos de UI:

```typescript
const {
  canShowCreateButton,
  canShowEditButton,
  canShowDeleteButton,
  canShowExportButton,
  canPerform,
  getAvailableActions,
  getPermissionClasses,
} = usePermissionUI(Resource.PROJECTS);

// Usar em template
<button v-if="canShowCreateButton">Criar</button>

// Obter ações disponíveis
const actions = getAvailableActions() // [Action.READ, Action.CREATE, ...]

// Classes CSS
:class="getPermissionClasses()" // "has-read has-create has-delete"
```

### Guards de Rota

Configurar rotas com verificações automáticas:

```typescript
import { createPermissionGuards, withPermission, withRole, withAuth } from '@/composables/useRoutePermissions';

const routes = [
  {
    path: '/projects',
    component: Projects,
    meta: withPermission(Resource.PROJECTS, Action.READ),
  },
  {
    path: '/users',
    component: Users,
    meta: withRole(UserRole.ADMIN),
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: withAuth(),
  },
];

createPermissionGuards(router);
```

## 📚 Exemplos

### Backend: GraphQL Resolver Completo

```typescript
const criteriaResolver = {
  Query: {
    criteria: async (_: any, __: any, context: GraphQLContext) => {
      verifyPermission(context, Resource.CRITERIA, Action.READ);
      return await prisma.criterion.findMany();
    },
  },

  Mutation: {
    createCriterion: async (
      _: any,
      args: { name: string; description: string; weight: number; type: string },
      context: GraphQLContext,
    ) => {
      verifyPermission(context, Resource.CRITERIA, Action.CREATE);

      return await prisma.criterion.create({
        data: {
          name: args.name,
          description: args.description,
          weight: args.weight,
          type: args.type,
        },
      });
    },

    deleteCriterion: async (_: any, args: { id: string }, context: GraphQLContext) => {
      verifyPermission(context, Resource.CRITERIA, Action.DELETE);
      return await prisma.criterion.delete({ where: { id: args.id } });
    },
  },
};
```

### Frontend: Vue Component Completo

```vue
<template>
  <div class="projects-container">
    <h1>Projetos</h1>

    <!-- Seção de ações -->
    <div class="toolbar">
      <button
        v-if="canCreate(Resource.PROJECTS)"
        @click="showCreateDialog = true"
        class="btn btn-primary"
      >
        Novo Projeto
      </button>
      <button
        v-if="canExport(Resource.PROJECTS)"
        @click="exportProjects"
        class="btn btn-secondary"
      >
        Exportar
      </button>
    </div>

    <!-- Lista de projetos -->
    <div v-if="canRead(Resource.PROJECTS)" class="projects-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <div class="project-header">
          <h3>{{ project.name }}</h3>
          <p class="description">{{ project.description }}</p>
        </div>

        <div class="project-actions">
          <button
            v-if="canUpdate(Resource.PROJECTS)"
            @click="editProject(project)"
            class="btn-icon"
          >
            Edit
          </button>
          <button
            v-if="canDelete(Resource.PROJECTS)"
            @click="deleteProject(project.id)"
            class="btn-icon btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Admin panel -->
    <div v-if="isAdmin" class="admin-section mt-4">
      <hr />
      <h2>Painel Administrativo</h2>
      <!-- Conteúdo admin -->
    </div>

    <!-- Sem permissão -->
    <div v-else-if="!canRead(Resource.PROJECTS)" class="alert alert-warning">
      Você não tem permissão para visualizar projetos.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePermissions, Resource, Action } from '@/composables/usePermissions';

const { can, canCreate, canRead, canUpdate, canDelete, canExport, isAdmin } = usePermissions();

const projects = ref([]);
const showCreateDialog = ref(false);

const editProject = (project: any) => {
  console.log('Editando projeto:', project.id);
};

const deleteProject = (projectId: string) => {
  console.log('Deletando projeto:', projectId);
};

const exportProjects = () => {
  console.log('Exportando projetos');
};
</script>

<style scoped>
.projects-container {
  padding: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.projects-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
</style>
```

## ✅ Melhores Práticas

### Backend

1. **Sempre verificar permissão em Mutations**
   ```typescript
   verifyPermission(context, Resource.PROJECTS, Action.CREATE);
   ```

2. **Usar Guards específicos para diferentes casos**
   ```typescript
   requireAuth(context)      // Qualquer usuário autenticado
   requireAdmin(context)     // Apenas admin
   ```

3. **Não confiar apenas em tipos de dados**
   - Sempre verificar no backend
   - Frontend é apenas para UX

4. **Logar tentativas de acesso negado**
   ```typescript
   if (!result.granted) {
     console.warn(`Acesso negado: ${result.reason}`);
   }
   ```

### Frontend

1. **Inicializar permissões após login**
   ```typescript
   handleLoginSuccess(user) {
     const { initializePermissions } = usePermissions();
     initializePermissions(user.role, user.id, user.email);
   }
   ```

2. **Limpar permissões ao logout**
   ```typescript
   handleLogout() {
     const { clearPermissions } = usePermissions();
     clearPermissions();
   }
   ```

3. **Usar composables em componentes**
   ```typescript
   const { can, canCreate, isAdmin } = usePermissions();
   ```

4. **Aplicar guards de rota**
   ```typescript
   meta: withPermission(Resource.PROJECTS, Action.CREATE)
   ```

5. **Não ocultar tudo - mostrar mensagens**
   ```vue
   <div v-else class="alert">Sem permissão</div>
   ```

## 🔒 Segurança

### Princípios de Segurança

1. **Defense in Depth**: Verificar permissões no backend E frontend
2. **Princípio do Menor Privilégio**: Usuários só têm permissões necessárias
3. **Auditoria**: Logar todas as ações negadas
4. **Isolamento**: Admin isolado em recurso específico

### Boas Práticas

- ✅ Backend verifica SEMPRE
- ✅ Frontend oculta por UX
- ✅ JWTs com expiração curta
- ✅ Refresh tokens armazenados seguramente
- ✅ Roles imutáveis no token
- ✅ Logs de acesso negado

## 📈 Adicionando Novos Recursos

### 1. Adicionar novo Resource

```typescript
// types/index.ts
enum Resource {
  // ... existing
  REPORTS = 'REPORTS',  // Novo
}
```

### 2. Adicionar permissões ao role

```typescript
// policies/rbac.policies.ts
[UserRole.DECISOR]: {
  permissions: [
    // ... existing
    { resource: Resource.REPORTS, action: Action.CREATE },
    { resource: Resource.REPORTS, action: Action.READ },
  ],
}
```

### 3. Usar em resolver

```typescript
Mutation: {
  createReport: async (_: any, args: any, context: GraphQLContext) => {
    verifyPermission(context, Resource.REPORTS, Action.CREATE);
    // implementação
  },
}
```

## 🚀 Próximos Passos

- [ ] Adicionar roles customizados (dinâmicos no DB)
- [ ] Implementar context-aware permissions (por projeto/departamento)
- [ ] Audit logging completo
- [ ] Rate limiting por role
- [ ] Dashboard de análise de acessos
