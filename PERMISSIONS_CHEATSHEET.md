# Cheat Sheet - Módulo de Permissões

## 📱 Uso Rápido

### Backend - GraphQL Resolver

```typescript
import { verifyPermission, Resource, Action } from '@/modules/permissions';

Mutation: {
  createProject: async (_: any, args: any, context: GraphQLContext) => {
    // ✅ Verificar permissão
    verifyPermission(context, Resource.PROJECTS, Action.CREATE);
    
    // Resto da lógica...
    return await prisma.project.create({ data: args });
  },
}
```

### Frontend - Vue Component

```vue
<template>
  <button v-if="canCreate(Resource.PROJECTS)" @click="create">
    Create Project
  </button>
</template>

<script setup lang="ts">
import { usePermissions, Resource } from '@/composables/usePermissions';
const { canCreate } = usePermissions();
</script>
```

### Frontend - Route Guard

```typescript
const routes = [
  {
    path: '/projects',
    component: Projects,
    meta: withPermission(Resource.PROJECTS, Action.READ),
  },
];

createPermissionGuards(router);
```

---

## 🔑 Recursos e Ações

### Resources
- `PROJECTS` - Projetos
- `CRITERIA` - Critérios
- `EVALUATIONS` - Avaliações
- `RESULTS` - Resultados VIKOR
- `USERS` - Gerenciamento de usuários
- `PERMISSIONS` - Configuração de permissões

### Actions
- `CREATE` - Criar novo recurso
- `READ` - Visualizar/listar recurso
- `UPDATE` - Editar recurso
- `DELETE` - Deletar recurso
- `EXPORT` - Exportar dados
- `VIEW_RESULTS` - Visualizar resultados
- `MANAGE_USERS` - Gerenciar roles de usuários
- `MANAGE_PERMISSIONS` - Editar matriz de permissões

---

## 👥 Roles

### ADMIN
- ✅ **Todas** as permissões em **todos** os recursos
- Acesso completo ao sistema

### DECISOR
- ✅ Create, Read, Update, Export em: Projetos, Critérios, Avaliações
- ✅ View Results, Export em: Resultados
- ❌ Sem acesso a: Gestão de Usuários

### ANALYST
- ✅ Read em: Projetos, Critérios
- ✅ Create, Read, Update em: Avaliações
- ✅ View Results, Export em: Resultados
- ❌ Sem acesso a: Criar/Editar Projetos, Gestão de Usuários

### VIEWER
- ✅ Read em: Projetos, Critérios, Avaliações
- ✅ View Results, Export em: Resultados
- ❌ Sem acesso a: Create, Update, Delete

---

## 🛠️ Backend - Verificações Comuns

### Verificação Simples
```typescript
verifyPermission(context, Resource.PROJECTS, Action.CREATE);
// Throw error se não tiver permissão
```

### Múltiplas Permissões
```typescript
const result = PermissionService.checkPermissions(permContext, [
  { resource: Resource.PROJECTS, action: Action.READ },
  { resource: Resource.EVALUATIONS, action: Action.CREATE },
]);

if (!result.granted) {
  throw new Error(`Forbidden: ${result.reason}`);
}
```

### Verificar sem Lançar Erro
```typescript
const result = PermissionService.checkPermission(
  permContext,
  Resource.PROJECTS,
  Action.CREATE
);

if (result.granted) {
  // fazer algo
}
```

### Helpers Rápidos
```typescript
PermissionService.isAdmin(permContext)
PermissionService.isDecisomakingRole(permContext)
PermissionService.canRead(permContext, Resource.PROJECTS)
PermissionService.canCreate(permContext, Resource.CRITERIA)
PermissionService.canUpdate(permContext, Resource.EVALUATIONS)
PermissionService.canDelete(permContext, Resource.PROJECTS)
```

### Rejeitar Admin
```typescript
if (!PermissionService.isAdmin(permContext)) {
  throw new Error('Forbidden: Admin access required');
}
```

---

## 🎨 Frontend - Verificações Comuns

### Composable Principal
```typescript
const {
  can,              // Verificação customizada: can(resource, action)
  canCreate,        // Atalho: canCreate(resource)
  canRead,          // Atalho: canRead(resource)
  canUpdate,        // Atalho: canUpdate(resource)
  canDelete,        // Atalho: canDelete(resource)
  canExport,        // Atalho: canExport(resource)
  isAdmin,          // Computed: true se admin
  isDecisionMaker,  // Computed: true se admin ou decisor
  permissions,      // Computed: array de permissões
} = usePermissions();
```

### Composable UI
```typescript
const {
  canShowCreateButton,   // Computed
  canShowEditButton,     // Computed
  canShowDeleteButton,   // Computed
  canShowExportButton,   // Computed
  canPerform,           // Método: verifica ação específica
  getAvailableActions,  // Método: retorna array de ações
  getPermissionClasses, // Método: retorna classes CSS
} = usePermissionUI(Resource.PROJECTS);
```

### No Template
```vue
<!-- Mostrar se pode ler -->
<div v-if="canRead(Resource.PROJECTS)">
  <!-- conteúdo -->
</div>

<!-- Mostrar botões baseado em permissão -->
<button v-if="canCreate(Resource.PROJECTS)">Create</button>
<button v-if="canUpdate(Resource.PROJECTS)">Edit</button>
<button v-if="canDelete(Resource.PROJECTS)">Delete</button>

<!-- Admin only -->
<div v-if="isAdmin">Admin content</div>

<!-- Dynamicamente -->
<div :class="getPermissionClasses()">
  <!-- has-read has-create has-delete has-export -->
</div>
```

---

## 🚀 Inicializar & Limpar

### Após Login
```typescript
const { initializePermissions } = usePermissions();

initializePermissions(
  UserRole.DECISOR,    // role
  'user-id-123',       // userId
  'user@email.com'     // email
);
```

### No Logout
```typescript
const { clearPermissions } = usePermissions();
clearPermissions();
```

---

## 🛣️ Route Guards

### Definição com Permissões
```typescript
meta: withPermission(Resource.PROJECTS, Action.CREATE)
```

### Definição com Roles
```typescript
meta: withRole(UserRole.ADMIN, UserRole.DECISOR)
```

### Apenas Autenticado
```typescript
meta: withAuth()
```

### Aplicar Guards
```typescript
import { createPermissionGuards } from '@/composables/useRoutePermissions';

createPermissionGuards(router);
```

---

## 📊 Matriz de Permissões Padrão

| Resource | ADMIN | DECISOR | ANALYST | VIEWER |
|----------|:-----:|:-------:|:-------:|:------:|
| **PROJECTS** | CRUD* | CRU | R | R |
| **CRITERIA** | CRUD | CRU | R | R |
| **EVALUATIONS** | CRUD | CRU | CRU | R |
| **RESULTS** | R,E | R,E | R,E | R,E |
| **USERS** | CRUD,M | - | - | - |
| **PERMISSIONS** | M | - | - | - |

*C=Create, R=Read, U=Update, D=Delete, E=Export, M=Manage

---

## ⚠️ Exceções e Casos Especiais

### Usuário Edita Apenas a Si Mesmo
```typescript
if (context.user?.role !== 'ADMIN' && args.id !== context.user?.id) {
  throw new Error('Can only update your own profile');
}
```

### Filtrar Dados Conforme Role
```typescript
const projects = await prisma.project.findMany({
  where:
    context.user?.role === 'ADMIN'
      ? {}
      : { ownerId: context.user?.id }
});
```

### Permissão Condicional
```typescript
if (
  context.user?.role !== 'ADMIN' &&
  !await userIsProjectOwner(args.id, context.user?.id)
) {
  throw new Error('Forbidden');
}
```

---

## 🧪 Teste Com Curl

### Login e Obter Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"decisor@tcc.local","password":"Decisor@123"}'
```

### Usar Token em GraphQL
```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ projects { id name } }"}'
```

---

## 📝 Arquivos do Módulo

```
src/modules/permissions/
├── types/                    # Enums e interfaces
│   └── index.ts             # Resource, Action, UserRole, etc
├── policies/                # Definições de acesso por role
│   └── rbac.policies.ts     # ROLE_PERMISSIONS, hasPermission()
├── services/                # Lógica de verificação
│   └── permission.service.ts # PermissionService (métodos principais)
├── guards/                  # Middleware GraphQL
│   └── permission.guard.ts  # verifyPermission, requireAuth, etc
├── index.ts                 # Export tudo
└── examples.ts              # Exemplos de uso
```

## 📚 Frontend

```
src/composables/
├── usePermissions.ts        # Composable principal
├── usePermissionUI.ts       # Para UI (buttons, etc)
├── useRoutePermissions.ts   # Route guards
└── examples.vue             # Exemplos
```

---

## 🔗 Referências Completas

- Documentação completa: `PERMISSIONS_MODULE.md`
- Exemplos backend: `apps/backend/src/modules/permissions/examples.ts`
- Exemplos frontend: `apps/frontend/src/composables/examples.vue`
