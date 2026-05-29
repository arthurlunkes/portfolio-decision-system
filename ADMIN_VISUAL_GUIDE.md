# 🎨 Dashboard Admin - Diagrama Visual

## 3 Páginas de Administração de Permissões

```
                    📱 FRONTEND (Vue 3)
          ┌──────────────────────────────────┐
          │     PAINEL DE ADMINISTRAÇÃO       │
          └──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼

┌─────────────────┐ ┌──────────────────┐ ┌────────────────┐
│ CONTROLE DE     │ │   DASHBOARD DE   │ │    USUÁRIOS    │
│    ACESSO       │ │  PERMISSÕES      │ │   (Atualizado) │
│                 │ │                  │ │                │
│ /access-control │ │ /permissions-    │ │  /users        │
│                 │ │  admin           │ │                │
│ ✅ Apenas ADMIN │ │                  │ │ ✅ Apenas ADMIN│
│                 │ │ ✅ Apenas ADMIN  │ │                │
└─────────────────┘ └──────────────────┘ └────────────────┘
        │                  │                      │
        │                  │                      │
        ▼                  ▼                      ▼
    [Tabela]         [Matriz]                [Formulário]
    [Modal]          [Abas]                  [Novo ANALYST]
```

---

## 1️⃣ CONTROLE DE ACESSO (`/access-control`)

```
┌────────────────────────────────────────────────────────┐
│  GERENCIADOR DE ACESSO                                 │
│  Atribua papéis aos usuários e controle permissões    │
└────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ [Buscar...]  [Todos] [Admin] [Dec.] [Analistas]     │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Usuário      │ Papel  │ Permissões    │ Status │ Ações       │
├──────────────┼────────┼───────────────┼────────┼─────────────┤
│ João Silva   │ 📊 Dec │ C R U E       │ ✅     │ [Gerenciar] │
│ Maria Santos │ 🔍 Ana │ R U E         │ ✅     │ [Gerenciar] │
│ Pedro Costa  │ 👁️ Viz │ R E           │ ✅     │ [Gerenciar] │
│ Ana Clara    │ 🔐 Ad  │ C R U D E M   │ ✅     │ [Gerenciar] │
└──────────────┴────────┴───────────────┴────────┴─────────────┘

     [Modal ao clicar "Gerenciar"]
     ┌─────────────────────────────┐
     │ 🎯 Gerenciar Acesso         │
     │                             │
     │ João Silva (joao@...)       │
     │                             │
     │ Papel: [📊 Dec] [🔍 Ana]    │
     │                             │
     │ ✅ Permissões do Papel:     │
     │ ✓ Criar Projetos            │
     │ ✓ Ler Projetos              │
     │ ✓ Atualizar Projetos        │
     │ ✓ Exportar Projetos         │
     │ ✓ Criar Avaliações          │
     │ ✓ ... (mais)                │
     │                             │
     │ Ativo: [ON]                 │
     │                             │
     │ [Cancelar] [Salvar]         │
     └─────────────────────────────┘

 ✅ Usa para: Gerenciar papéis individuais
 ✅ Melhor para: Admin dia-a-dia
```

---

## 2️⃣ DASHBOARD DE PERMISSÕES (`/permissions-admin`)

```
┌─────────────────────────────────────────────────────────┐
│  GERENCIADOR DE PERMISSÕES                              │
│  Controle de acesso baseado em papéis e recursos       │
└─────────────────────────────────────────────────────────┘

📊 ESTATÍSTICAS
┌──────────────┬───────────┬─────────────┬────────────┐
│ Total: 12    │ Admin: 2  │ Decisor: 5  │ Analista: 4│
│ usuários     │           │             │            │
└──────────────┴───────────┴─────────────┴────────────┘

📑 ABAS
[📊 Matriz] [👤 Papéis] [📋 Auditoria]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MATRIZ DE PERMISSÕES

Recurso      │ ADMIN        │ DECISOR      │ ANALYST      │ VIEWER
─────────────┼──────────────┼──────────────┼──────────────┼──────────
Projetos     │ C R U D E    │ C R U E      │ R            │ R
Critérios    │ C R U D      │ C R U        │ R            │ R
Avaliações   │ C R U D      │ C R U        │ C R U        │ R
Resultados   │ R E          │ R E          │ R E          │ R E
Usuários     │ C R U D M    │ —            │ —            │ —
Permissões   │ M            │ —            │ —            │ —

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POR PAPÉIS

┌──────────────┐  ┌──────────────┐
│ 🔐 ADMIN     │  │ 📊 DECISOR   │
│              │  │              │
│ • Criar X    │  │ • Criar Proj │
│ • Ler X      │  │ • Ler Proj   │
│ • Atualizar X│  │ • Atualizar  │
│ • Deletar X  │  │ • Exportar   │
│ • Exportar   │  │ • ... (mais) │
│ • Gerenciar  │  │              │
│ • ... (mais) │  │              │
└──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐
│ 🔍 ANALISTA  │  │ 👁️ VIEWER    │
│              │  │              │
│ • Ler Proj   │  │ • Ler X      │
│ • Criar Aval │  │ • Ver Result │
│ • Ler Aval   │  │ • Exportar   │
│ • Atualizar  │  │              │
│ • Ver Result │  │              │
│ • Exportar   │  │              │
│ • ... (mais) │  │              │
└──────────────┘  └──────────────┘

✅ Usa para: Entender estrutura completa
✅ Melhor para: Revisar políticas, relatórios
```

---

## 3️⃣ USUÁRIOS (Atualizado) (`/users`)

```
┌────────────────────────────────────────────────────────┐
│  DECISORES                                             │
│  Gerencie os usuários que participam das avaliações   │
└────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ [Buscar...]  [Todos] [Admin] [Dec.] [Ana.] [Viz.]   │
└──────────────────────────────────────────────────────┘
                          ↑
                     NOVO: [Ana.] para Analistas!

┌──────────────────────────────────────────────────────────────┐
│ Usuário      │ Papel  │ Status │ Criado em    │ Ações       │
├──────────────┼────────┼────────┼──────────────┼─────────────┤
│ João Silva   │ 📊 Dec │ ✅ Ati │ 01/05/2026   │ ✏️ 🔐 🗑️    │
│ Maria Santos │ 🔍 Ana │ ✅ Ati │ 02/05/2026   │ ✏️ 🔐 🗑️    │
│ Pedro Costa  │ 👁️ Viz │ ✅ Ati │ 03/05/2026   │ ✏️ 🔐 🗑️    │
│ Ana Clara    │ 🔐 Ad  │ ✅ Ati │ 20/04/2026   │ ✏️ 🔐 🗑️    │
└──────────────┴────────┴────────┴──────────────┴─────────────┘

[Novo Decisor]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

     [Modal ao clicar ✏️]
     ┌─────────────────────────────┐
     │ Editar Decisor              │
     │                             │
     │ Nome: [João Silva]          │
     │ E-mail: [joao@...]          │
     │ Senha: [editável]           │
     │                             │
     │ Papel (NOVO: com cores):    │
     │ ┌────┬────┬────┬────┐      │
     │ │🔐  │📊  │🔍  │👁️ │      │
     │ │Ad  │Dec │Ana │Viz│      │
     │ │    │✓   │    │    │      │
     │ └────┴────┴────┴────┘      │
     │                             │
     │ Ativo: [ON]                 │
     │                             │
     │ [Cancelar] [Salvar]         │
     └─────────────────────────────┘

✅ Usa para: Criar/editar informações básicas
✅ Novo: Suporte a ANALYST com cor verde
```

---

## 🔀 Fluxo de Trabalho Típico

```
Admin quer promover Visualizador para Analista
    │
    ├─→ Opção 1: Via Controle de Acesso (recomendado)
    │      ↓
    │   Ir para /access-control
    │      ↓
    │   Procurar usuário com papel "VIEWER"
    │      ↓
    │   Clicar "Gerenciar"
    │      ↓
    │   Mudar para "🔍 Analista"
    │      ↓
    │   Ver permissões atualizarem (agora tem CREATE em EVALUATIONS)
    │      ↓
    │   Clicar "Salvar Alterações"
    │      ↓
    │   ✅ Pronto! Usuário promovido
    │
    │
    └─→ Opção 2: Via Página de Usuários
           ↓
        Ir para /users
           ↓
        Clicar ✏️ no usuário
           ↓
        Selecionar "🔍 Analista"
           ↓
        Clicar "Salvar Alterações"
           ↓
        ✅ Pronto! (mesma coisa)
```

---

## 🎭 Papéis Disponíveis (Atualizado)

```
🔐 ADMIN
├─ Acesso: TOTAL
├─ Usa: Gerentes TI
└─ Permissões: 14+ (criar, ler, atualizar, deletar TUDO)

📊 DECISOR
├─ Acesso: Criar e gerenciar projetos/critérios/avaliações
├─ Usa: Executivos, Gerentes de Projeto
└─ Permissões: 10+ (C, R, U em recursos principais)

🔍 ANALYST (NOVO!)
├─ Acesso: Visualizar projetos, criar avaliações
├─ Usa: Analistas de Dados, Pesquisadores
└─ Permissões: 7+ (R em projetos/critérios, C, R, U em avaliações)

👁️ VIEWER
├─ Acesso: Apenas leitura
├─ Usa: Stakeholders, Consultores Externos
└─ Permissões: 5 (R em tudo, E em resultados)
```

---

## 📚 Arquivos Criados/Modificados

### ✨ NOVO (Frontend)
- `AccessControl.vue` - Gerenciar acesso por usuário
- `PermissionsAdmin.vue` - Dashboard com matriz + stats
- `PermissionCell.vue` - Componente de célula de permissão
- `RoleBadge.vue` - Badge visual do papel
- `permissionMatrix.ts` - Lógica de matriz
- `services/api/permissions.ts` - API de permissões

### 📝 ATUALIZADO
- `Users.vue` - Adicionado suporte a ANALYST
- `services/api/users.ts` - Adicionado ANALYST ao tipo UserRole

### 📖 DOCUMENTAÇÃO
- `FRONTEND_PERMISSIONS_ADMIN.md` - Guia de uso
- `ADMIN_DASHBOARD_GUIDE.md` - Este arquivo!

---

## 🚀 Começar Agora

### 1. Login como ADMIN
```
Email: admin@tcc.local
Senha: Decisor@123
```

### 2. Escolha uma página:

**Quer gerenciar um usuário?** → `/access-control` ⭐ Recomendado
**Quer ver a matriz completa?** → `/permissions-admin`
**Quer criar novo usuário?** → `/users`

### 3. Faça suas alterações

### 4. Pronto! As permissões estão atualizadas

---

## ✅ Segurança

```
🔒 Frontend
├─ Páginas protegidas (apenas ADMIN)
├─ Botões desabilitados sem permissão
└─ UX amigável

🔒 Backend (CRÍTICO!)
├─ Verifica JWT em cada resolver
├─ Lê role do token
├─ Consulta ROLE_PERMISSIONS
├─ Nega se sem permissão
└─ Log de acesso negado
```

**Sempre confiar no backend!**

---

## 💡 Dicas & Tricks

✅ Use `/access-control` para gerenciar dia-a-dia
✅ Use `/permissions-admin` para auditar/revisar
✅ Use `/users` para onboarding de novos usuários
✅ Todos os 4 papéis têm cores diferentes
✅ A matriz atualiza em tempo real
✅ Você pode mudar um papel a qualquer hora

---

## 🆘 Problema?

| Problema | Solução |
|----------|---------|
| "Admin access required" | Login como admin@tcc.local |
| Página em branco | Verificar console (F12) |
| Mudanças não salvam | Verificar rede (F12 → Network) |
| Permissões erradas | Sincronizar frontend/backend |

---

**Parabéns! 🎉 Sistema de permissões implementado com sucesso!**
