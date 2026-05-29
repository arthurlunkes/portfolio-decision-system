# Arquitetura do Módulo de Permissões

## 🏗️ Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vue 3)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  usePermissions()           usePermissionUI()              │
│  ├─ can()                   ├─ canShowCreateButton         │
│  ├─ canCreate()             ├─ canShowEditButton           │
│  ├─ canDelete()             ├─ getAvailableActions()       │
│  ├─ isAdmin                 └─ getPermissionClasses()      │
│  └─ initializePermissions()                                │
│                                                             │
│  createPermissionGuards()                                   │
│  ├─ Protege rotas                                          │
│  ├─ Verifica permissão antes de navegar                   │
│  └─ Redireciona se sem permissão                          │
│                                                             │
└─────────────┬───────────────────────────────────────────────┘
              │ GraphQL Requests com JWT
              │ Authorization: Bearer {token}
              ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + GraphQL)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  API Middleware                                            │
│  ├─ verifyToken(JWT)                                       │
│  ├─ Extrai: userId, email, role                           │
│  └─ Cria context.user                                     │
│                                                             │
│  GraphQL Context                                           │
│  └─ context.user { id, email, role }                      │
│                                                             │
│  GraphQL Resolvers                                         │
│  ├─ verifyPermission()                                     │
│  │  ├─ Lê context.user.role                               │
│  │  ├─ Verifica na ROLE_PERMISSIONS                       │
│  │  └─ Lança erro se negado                              │
│  │                                                        │
│  ├─ requireAuth()                                         │
│  ├─ requireAdmin()                                        │
│  └─ requireRole()                                         │
│                                                             │
│  PermissionService                                         │
│  ├─ checkPermission()                                      │
│  ├─ checkPermissions()                                     │
│  ├─ canRead()                                              │
│  ├─ canCreate()                                            │
│  ├─ canUpdate()                                            │
│  ├─ canDelete()                                            │
│  ├─ isAdmin()                                              │
│  └─ isDecisomakingRole()                                   │
│                                                             │
│  ROLE_PERMISSIONS (Política)                              │
│  └─ Matriz: Role → Resource → Actions                     │
│                                                             │
│  Database (Prisma)                                         │
│  └─ User model com role field                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Autorização

```
┌──────────────────────────────────────────────────────────────┐
│ 1. USUARIO FAZE LOGIN                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /api/auth/login                                       │
│  { email: "user@example.com", password: "..." }           │
│                   ↓                                          │
│  Backend verifica email + senha                            │
│                   ↓                                          │
│  Gera JWT com: { sub, email, role }                        │
│                   ↓                                          │
│  Retorna: { token, user: { id, email, role } }           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 2. FRONTEND INICIALIZA PERMISSÕES                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  handleLoginSuccess(user)                                   │
│            ↓                                                 │
│  const { initializePermissions } = usePermissions()        │
│            ↓                                                 │
│  initializePermissions(user.role, user.id, user.email)    │
│            ↓                                                 │
│  Armazena permissões em memória                            │
│  Componentes podem agora usar: canCreate(), canDelete()   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 3. USUARIO CLICA EM BOTÃO (Frontend)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  @click="createProject"                                     │
│            ↓                                                 │
│  Verifica: canCreate(Resource.PROJECTS)?                   │
│            ↓                                                 │
│        ✅ SIM              ❌ NÃO                           │
│         ↓                   ↓                               │
│    Habilita           Botão desabilitado                  │
│    Envia request      ou escondido                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 4. REQUISIÇÃO GRAPHQL CHEGA NO BACKEND                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  POST /graphql                                              │
│  Authorization: Bearer {jwt_token}                          │
│  Query/Mutation: createProject(...)                         │
│            ↓                                                 │
│  Backend middleware extrai token                           │
│            ↓                                                 │
│  Valida JWT signature                                      │
│            ↓                                                 │
│  Cria context.user { id, email, role }                    │
│            ↓                                                 │
│  Passa para resolver                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 5. RESOLVER VERIFICA PERMISSÃO (Backend)                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  createProject: async (_, args, context) => {              │
│    // Verificar permissão                                  │
│    verifyPermission(context,                               │
│      Resource.PROJECTS,                                    │
│      Action.CREATE)                                        │
│            ↓                                                 │
│    Lê: context.user.role (ex: DECISOR)                    │
│            ↓                                                 │
│    Consulta: ROLE_PERMISSIONS[DECISOR]                     │
│            ↓                                                 │
│    Procura: { PROJECTS, CREATE }?                          │
│            ↓                                                 │
│      ✅ ENCONTRADO        ❌ NÃO ENCONTRADO               │
│        ↓                       ↓                           │
│   Continua               Lança erro                        │
│   execução               "Forbidden"                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 6. EXECUTA AÇÃO OU RETORNA ERRO                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ PERMISSÃO CONCEDIDA:                                   │
│     return await prisma.project.create(...)               │
│     ↓ Retorna projeto criado                              │
│                                                              │
│  ❌ PERMISSÃO NEGADA:                                      │
│     throw new Error("Forbidden: ...")                      │
│     ↓ Retorna erro GraphQL                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                   ↓
┌──────────────────────────────────────────────────────────────┐
│ 7. FRONTEND RECEBE RESPOSTA                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ SUCESSO:                                               │
│     { data: { createProject: { id, name, ... } } }        │
│     ↓ Atualiza UI, mostra novo projeto                    │
│                                                              │
│  ❌ ERRO:                                                  │
│     { errors: [{ message: "Forbidden: ..." }] }           │
│     ↓ Mostra mensagem de erro                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 📊 Matriz de Permissões

```
┌────────────────┬───────┬─────────┬─────────┬────────┐
│ Resource/Role  │ ADMIN │ DECISOR │ ANALYST │ VIEWER │
├────────────────┼───────┼─────────┼─────────┼────────┤
│ PROJECTS       │ CRUD+ │ CRU+    │ R       │ R      │
│ CRITERIA       │ CRUD+ │ CRU+    │ R       │ R      │
│ EVALUATIONS    │ CRUD+ │ CRU+    │ CRU+    │ R      │
│ RESULTS        │ R+Exp │ R+Exp   │ R+Exp   │ R+Exp  │
│ USERS          │ CRUD+ │ —       │ —       │ —      │
│ PERMISSIONS    │ Mgmt  │ —       │ —       │ —      │
└────────────────┴───────┴─────────┴─────────┴────────┘

+ = EXPORT permission
C = CREATE, R = READ, U = UPDATE, D = DELETE
Mgmt = MANAGE_PERMISSIONS
```

## 🔐 Segurança - Verificação Dupla

```
┌─ Frontend (UX) ──────────────────────────────────┐
│                                                   │
│  usePermissions()                                │
│  └─ Verifica localmente                         │
│  └─ Mostra/esconde botões                       │
│  └─ Protege rotas com guards                    │
│                                                   │
│  ⚠️  NÃO é suficiente (usuário pode                │
│  checar console e fazer requisições diretas)    │
│                                                   │
└─────────────────────────────────────────────────┘
                    ↓
             Requisição HTTP
                    ↓
┌─ Backend (Segurança) ────────────────────────────┐
│                                                   │
│  verifyPermission()                              │
│  └─ Verifica JWT                                 │
│  └─ Extrai role                                  │
│  └─ Consulta ROLE_PERMISSIONS                    │
│  └─ Lança erro se negado                         │
│                                                   │
│  ✅ É seguro e confiável                        │
│  ✅ Usuário não pode contornar                   │
│                                                   │
└─────────────────────────────────────────────────┘

PRINCÍPIO: "Nunca confiar no frontend!"
```

## 🗂️ Estrutura de Arquivos

```
portfolio-decision-system/
│
├── apps/backend/src/modules/permissions/
│   ├── types/
│   │   └── index.ts                    # Enums e interfaces
│   ├── policies/
│   │   └── rbac.policies.ts            # Matriz de permissões
│   ├── services/
│   │   └── permission.service.ts       # Serviço de verificação
│   ├── guards/
│   │   └── permission.guard.ts         # Middleware GraphQL
│   ├── index.ts                        # Exports públicos
│   └── examples.ts                     # Exemplos de uso
│
├── apps/frontend/src/composables/
│   ├── usePermissions.ts               # Composable principal
│   ├── usePermissionUI.ts              # Para UI
│   ├── useRoutePermissions.ts          # Route guards
│   └── examples.vue                    # Exemplos
│
├── apps/backend/prisma/
│   ├── schema.prisma                   # ← ATUALIZADO (novo ANALYST role)
│   └── seed.ts                         # ← ATUALIZADO (novo usuário demo)
│
└── Documentação/
    ├── PERMISSIONS_MODULE.md           # Completa (80+ páginas)
    ├── PERMISSIONS_CHEATSHEET.md       # Quick reference
    ├── QUICK_START_PERMISSIONS.md      # Guia inicial
    └── ARCHITECTURE.md                 # Este arquivo
```

## 🚀 Fluxo de Implementação Recomendado

```
PASSO 1: Backend
├─ Importar permissões em src/index.ts
├─ Adicionar verifyPermission() em cada Mutation
├─ Testar com curl/Postman
└─ ✅ Pronto

PASSO 2: Frontend
├─ Inicializar permissões após login
├─ Usar usePermissions() em componentes
├─ Proteger componentes com v-if
└─ ✅ Pronto

PASSO 3: Route Guards
├─ Adicionar meta com withPermission()
├─ Chamar createPermissionGuards()
├─ Testar navegação
└─ ✅ Pronto

PASSO 4: Testes
├─ Login como cada role
├─ Verificar botões aparecem/desaparecem
├─ Tentar ações não permitidas
└─ ✅ Pronto
```

## 🔗 Integrações

```
┌─ Types (Enums) ──────────────────────┐
│ Resource, Action, UserRole           │
└────────┬────────────────────────────┘
         │
         ├─→ RBAC Policies
         │   └─ Matriz: Role → Permissions
         │
         ├─→ Permission Service
         │   └─ Verificações
         │
         ├─→ Permission Guards
         │   └─ Middleware GraphQL
         │
         └─→ Frontend Composables
             ├─ usePermissions
             ├─ usePermissionUI
             └─ useRoutePermissions
```

---

**Documentação Relacionada**:
- `PERMISSIONS_MODULE.md` - Documentação completa
- `PERMISSIONS_CHEATSHEET.md` - Quick reference
- `QUICK_START_PERMISSIONS.md` - Começar agora
