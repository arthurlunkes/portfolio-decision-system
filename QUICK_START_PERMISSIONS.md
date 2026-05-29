# Quick Start - Módulo de Permissões

## 🚀 Começar em 5 minutos

### 1️⃣ Backend - Proteger um Resolver GraphQL

```typescript
// Em qualquer resolver GraphQL (ex: src/index.ts)
import { verifyPermission, Resource, Action } from './modules/permissions/index.js';

const resolvers = {
  Mutation: {
    createProject: async (_: any, args: any, context: GraphQLContext) => {
      // ✅ Adicionar esta linha - verifica se o usuário tem permissão
      verifyPermission(context, Resource.PROJECTS, Action.CREATE);

      // Resto do código continua igual
      return await prisma.project.create({
        data: { name: args.name, description: args.description }
      });
    },
  },
};
```

**Pronto!** Agora apenas usuários com permissão de CREATE em PROJECTS podem chamar este resolver.

---

### 2️⃣ Frontend - Mostrar Botão Baseado em Permissão

```vue
<template>
  <button v-if="canCreate(Resource.PROJECTS)" @click="createProject">
    ➕ Novo Projeto
  </button>
</template>

<script setup lang="ts">
import { usePermissions, Resource } from '@/composables/usePermissions';

const { canCreate } = usePermissions();
</script>
```

**Pronto!** O botão só aparece se o usuário tem permissão.

---

### 3️⃣ Frontend - Proteger Uma Rota

```typescript
// Em router/index.ts
import { createPermissionGuards, withPermission } from '@/composables/useRoutePermissions';
import { Resource, Action } from '@/composables/usePermissions';

const router = createRouter({
  routes: [
    {
      path: '/projects/create',
      component: ProjectCreate,
      meta: withPermission(Resource.PROJECTS, Action.CREATE),
      // ✅ Se usuário não tiver permissão, é redirecionado
    },
  ],
});

createPermissionGuards(router);
```

**Pronto!** A rota está protegida.

---

## 📊 Matriz de Permissões Atual

| Recurso | ADMIN | DECISOR | ANALYST | VIEWER |
|---------|:-----:|:-------:|:-------:|:------:|
| **Projetos** | ✅ CRUD | ✅ CRU | ✅ R | ✅ R |
| **Critérios** | ✅ CRUD | ✅ CRU | ✅ R | ✅ R |
| **Avaliações** | ✅ CRUD | ✅ CRU | ✅ CRU | ✅ R |
| **Resultados** | ✅ RExp | ✅ RExp | ✅ RExp | ✅ RExp |
| **Usuários** | ✅ CRUDM | ❌ | ❌ | ❌ |
| **Permissões** | ✅ M | ❌ | ❌ | ❌ |

> C=Create, R=Read, U=Update, D=Delete, Exp=Export, M=Manage

---

## 🧑‍💼 Roles Explicados

### 🔒 ADMIN - Administrador
- Acesso completo a TUDO
- Pode gerenciar usuários e permissões
- **Use para**: Gerente TI, Administrador do Sistema

### 📊 DECISOR - Tomador de Decisão
- Pode criar e gerenciar projetos, critérios e avaliações
- Pode ver resultados
- **Use para**: Executivos, Gerentes de Projeto

### 🔍 ANALYST - Analista
- Pode visualizar projetos e critérios
- Pode criar e editar avaliações
- Pode ver resultados
- **Use para**: Analistas de Dados, Pesquisadores

### 👁️ VIEWER - Visualizador
- Apenas leitura
- Pode ver projetos, critérios, avaliações e resultados
- **Use para**: Stakeholders, Consultores Externos

---

## 🔧 Como Usar - Passo a Passo

### No Backend

Toda vez que você criar um novo resolver GraphQL que modifica dados:

```typescript
const Mutation = {
  // ❌ ANTES - Sem proteção
  deleteProject: async (_: any, args: any) => {
    return await prisma.project.delete({ where: { id: args.id } });
  },

  // ✅ DEPOIS - Com proteção
  deleteProject: async (_: any, args: any, context: GraphQLContext) => {
    verifyPermission(context, Resource.PROJECTS, Action.DELETE);
    return await prisma.project.delete({ where: { id: args.id } });
  },
};
```

### No Frontend

Toda vez que você tiver um botão ou ação:

```vue
<!-- ❌ ANTES - Sempre mostra -->
<button @click="delete">Delete</button>

<!-- ✅ DEPOIS - Só mostra se tiver permissão -->
<button v-if="canDelete(Resource.PROJECTS)" @click="delete">
  Delete
</button>
```

---

## 🧪 Testar com Usuários Demo

Após fazer `npm run seed`, você tem estes usuários:

| Email | Senha | Role |
|-------|:-----:|-----:|
| admin@tcc.local | Decisor@123 | ADMIN |
| decisor@tcc.local | Decisor@123 | DECISOR |
| analyst@tcc.local | Decisor@123 | ANALYST |
| viewer@tcc.local | Decisor@123 | VIEWER |

**Teste**: Faça login com cada um e veja diferenças de permissão!

---

## 📁 Arquivos Criados

```
apps/backend/src/modules/permissions/
├── types/index.ts                    # Enums: Resource, Action, UserRole
├── policies/rbac.policies.ts         # Matriz de permissões por role
├── services/permission.service.ts    # Métodos de verificação
├── guards/permission.guard.ts        # Middleware GraphQL
├── index.ts                          # Export tudo
└── examples.ts                       # Exemplos de uso

apps/frontend/src/composables/
├── usePermissions.ts                 # Composable principal
├── usePermissionUI.ts                # Para componentes UI
├── useRoutePermissions.ts            # Route guards
└── examples.vue                      # Exemplos

Documentação/
├── PERMISSIONS_MODULE.md             # Documentação completa
└── PERMISSIONS_CHEATSHEET.md         # Quick reference
```

---

## 🎯 Próximos Passos

### Recomendado Fazer Agora

1. ✅ **Adicionar permissões aos resolvers existentes**
   ```typescript
   verifyPermission(context, Resource.PROJECTS, Action.READ);
   ```

2. ✅ **Proteger componentes Vue**
   ```vue
   <button v-if="canCreate(Resource.PROJECTS)">Criar</button>
   ```

3. ✅ **Testar com diferentes usuários**
   - Login como viewer e veja sem permissão
   - Login como admin e veja com permissão

4. ✅ **Adicionar route guards**
   ```typescript
   meta: withPermission(Resource.PROJECTS, Action.CREATE)
   ```

### Futuro (Opcional)

- [ ] Audit logging: log de quem fez o quê
- [ ] Roles customizados: criar roles dinamicamente
- [ ] Permissões por projeto: ADMIN de um projeto específico
- [ ] Rate limiting por role: limitar requisições
- [ ] Dashboard de permissões: visualizar matriz

---

## 🆘 Problemas Comuns

### "Forbidden: User role VIEWER does not have CREATE permission on PROJECTS"

✅ **Normal!** Significa que está funcionando. O usuário VIEWER não tem permissão.
- Teste com ADMIN ou DECISOR se quiser que funcione
- Ou adicione a permissão em `policies/rbac.policies.ts`

### Botão aparece mas GraphQL retorna erro

⚠️ **Problema**: Frontend e backend desincronizados
- Certifique-se de que ambos têm a mesma permissão
- Backend: `verifyPermission(context, ...)`
- Frontend: `canCreate(Resource.PROJECTS)`

### Usuário não consegue fazer login

🔍 **Verificar**:
- Rolle do usuário está em `UserRole` enum? (ADMIN, DECISOR, ANALYST, VIEWER)
- Token JWT está sendo gerado com o role correto?

---

## 📚 Documentação Completa

Para detalhes completos, veja:
- **Documentação Completa**: `PERMISSIONS_MODULE.md`
- **Cheat Sheet**: `PERMISSIONS_CHEATSHEET.md`
- **Exemplos Backend**: `apps/backend/src/modules/permissions/examples.ts`
- **Exemplos Frontend**: `apps/frontend/src/composables/examples.vue`

---

## 💡 Dica: Entender o Fluxo

```
1. Usuário faz login
   ↓
2. Recebe JWT com role (ex: DECISOR)
   ↓
3. Clica em botão que requer CREATE permission
   ↓
4. Frontend verifica: canCreate(Resource.PROJECTS)?
   ✅ Sim → Mostra botão, permite clique
   ❌ Não → Esconde botão
   ↓
5. Se clicou, envia requisição GraphQL
   ↓
6. Backend recebe, extrai role do JWT
   ↓
7. Verifica: hasPermission(DECISOR, PROJECTS, CREATE)?
   ✅ Sim → Executa a ação
   ❌ Não → Retorna erro "Forbidden"
```

---

## 🎓 Exemplo Completo

### Backend: Novo Resolver
```typescript
import { verifyPermission, Resource, Action } from './modules/permissions/index.js';

const Mutation = {
  updateCriterion: async (
    _: any,
    args: { id: string; name: string; weight: number },
    context: GraphQLContext
  ) => {
    // ✅ Verificar permissão
    verifyPermission(context, Resource.CRITERIA, Action.UPDATE);
    
    // ✅ Executar a ação
    return await prisma.criterion.update({
      where: { id: args.id },
      data: { name: args.name, weight: args.weight }
    });
  },
};
```

### Frontend: Componente
```vue
<template>
  <div>
    <h2>Editar Critério: {{ criterion.name }}</h2>
    
    <input v-model="criterion.name" type="text">
    <input v-model="criterion.weight" type="number">
    
    <!-- ✅ Botão só aparece se tiver permissão -->
    <button 
      v-if="canUpdate(Resource.CRITERIA)" 
      @click="save"
      class="btn btn-primary"
    >
      Salvar
    </button>
    
    <!-- ✅ Mensagem se não tiver permissão -->
    <p v-else class="text-warning">
      Você não tem permissão para editar critérios
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePermissions, Resource } from '@/composables/usePermissions';

const { canUpdate } = usePermissions();
const criterion = ref({ name: '', weight: 0.5 });

const save = () => {
  console.log('Salvando...', criterion.value);
};
</script>
```

---

**Pronto para começar! 🎉**

Qualquer dúvida, consulte a documentação completa em `PERMISSIONS_MODULE.md`
