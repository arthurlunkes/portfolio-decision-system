# 🎨 Gerenciador de Papéis - Documentação Completa

Página completa para criar, editar, deletar e gerenciar papéis de usuários com permissões customizáveis.

## 📍 Localização

- **Arquivo**: `apps/frontend/src/pages/RolesManager.vue`
- **Rota**: `/roles` ou `/roles-manager` (apenas ADMIN)
- **Componentes auxiliares**:
  - `PermissionToggleGrid.vue` - Editor visual de permissões
  - API: `services/api/roles.ts`

---

## 🎯 O que você pode fazer

```
┌────────────────────────────────────────────────┐
│     GERENCIADOR DE PAPÉIS                      │
│     Crie, edite e gerencie papéis              │
└────────────────────────────────────────────────┘

✅ CRIAR novo papel com permissões customizadas
✅ EDITAR papéis existentes (descrição + permissões)
✅ DELETAR papéis customizados (não papéis do sistema)
✅ CLONAR papéis para usar como base
✅ VISUALIZAR todas as permissões em matriz
✅ BUSCAR/FILTRAR papéis
✅ VER quantas permissões cada papel tem
```

---

## 📺 Tela Principal

```
┌──────────────────────────────────────────────────────────┐
│ GERENCIADOR DE PAPÉIS                    [Novo Papel ➕] │
│ Crie, edite e gerencie papéis                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ [Buscar papel...] [✅ Apenas Sistema] [Todos]           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Nome         │ Descrição           │ Permissões │ Ações  │
├──────────────┼─────────────────────┼────────────┼────────┤
│ 🔐 ADMIN     │ Acesso total        │    14      │ ✏️ 🗂️ │
│   Administ.. │                     │            │        │
├──────────────┼─────────────────────┼────────────┼────────┤
│ 📊 DECISOR   │ Criar/editar proj.. │    10      │ ✏️ 🗂️ 🗑│
│   Decisor    │                     │            │        │
├──────────────┼─────────────────────┼────────────┼────────┤
│ 🔍 ANALYST   │ Analista - criar    │     7      │ ✏️ 🗂️  │
│   Analista   │ avaliações...       │            │        │
├──────────────┼─────────────────────┼────────────┼────────┤
│ CUSTOM_QA    │ QA Customizado      │     5      │ ✏️ 🗂️ 🗑│
│   QA Team    │                     │            │        │
└──────────────┴─────────────────────┴────────────┴────────┘

Ações:
✏️  = Editar
🗂️  = Clonar
🗑️  = Deletar (não aparece em papéis do sistema)
```

---

## 🎬 Como Usar

### 1️⃣ Criar Novo Papel

```
1. Clicar em [Novo Papel ➕]
   ↓
2. Modal abre com formulário:
   ┌─────────────────────────────────────┐
   │ Novo Papel                          │
   │                                     │
   │ Nome do Papel:                      │
   │ [CUSTOM_ANALYST]                    │
   │ Use: letras e underscore            │
   │                                     │
   │ Rótulo/Título:                      │
   │ [Analista Customizado]              │
   │ (Como exibir para usuários)         │
   │                                     │
   │ Descrição:                          │
   │ [Analista customizado para X...]    │
   │                                     │
   │ Permissões:                         │
   │ ┌─────────────────────────────────┐ │
   │ │ [Criar Tudo] [Ler Tudo] ...     │ │
   │ │                                 │ │
   │ │ Recurso    │ C │ R │ U │ D │ E │ │
   │ │ Projetos   │ ✓ │ ✓ │ ✓ │   │   │ │
   │ │ Critérios  │   │ ✓ │   │   │   │ │
   │ │ Avaliações │ ✓ │ ✓ │ ✓ │   │ ✓ │ │
   │ │ Resultados │   │ ✓ │   │   │ ✓ │ │
   │ │ Usuários   │   │   │   │   │   │ │
   │ │ Permissões │   │   │   │   │   │ │
   │ │                                 │ │
   │ │ 6 permissões selecionadas       │ │
   │ │                                 │ │
   │ │ [Cancelar] [Criar Papel]        │ │
   │ └─────────────────────────────────┘ │
   └─────────────────────────────────────┘
   ↓
3. Preencher:
   - Nome: identificador único (ex: CUSTOM_ANALYST)
   - Rótulo: nome legível (ex: "Analista Customizado")
   - Descrição: explicar o propósito
   ↓
4. Selecionar permissões:
   - Clicar nos checkboxes
   - Ou clicar "Criar Tudo", "Ler Tudo", etc para todos de uma ação
   ↓
5. Clicar [Criar Papel]
   ↓
6. ✅ Papel criado! Aparece na lista
```

### 2️⃣ Editar Papel Existente

```
1. Na lista, clicar em ✏️ no papel
   ↓
2. Modal abre com dados pré-preenchidos
   (Nota: Nome não pode ser editado)
   ↓
3. Mudar:
   - Rótulo
   - Descrição
   - Permissões (matriz interativa)
   ↓
4. Clicar [Salvar Alterações]
   ↓
5. ✅ Papel atualizado!
   (Usuários com este papel recebem as novas permissões!)
```

### 3️⃣ Deletar Papel

```
1. Na lista, clicar em 🗑️ no papel
   (Nota: Só aparece em papéis customizados, não em SYSTEM)
   ↓
2. Modal de confirmação:
   ┌─────────────────────────────────┐
   │ ⚠️  Deletar Papel                │
   │                                 │
   │ Tem certeza que deseja deletar   │
   │ o papel "Analista Customizado"? │
   │                                 │
   │ ⚠️ Usuários com este papel       │
   │    precisarão ser reatribuídos   │
   │                                 │
   │ [Cancelar] [Deletar Papel]       │
   └─────────────────────────────────┘
   ↓
3. Clicar [Deletar Papel]
   ↓
4. ✅ Papel deletado!
   (Usuários perdem o papel, precisam de novo)
```

### 4️⃣ Clonar Papel

```
1. Na lista, clicar em 🗂️ no papel
   ↓
2. Modal de clone:
   ┌─────────────────────────────────┐
   │ Clonar Papel                    │
   │                                 │
   │ Clonando papel "DECISOR"        │
   │ com todas as suas permissões    │
   │                                 │
   │ Nome do novo papel:             │
   │ [DECISOR_COPY]                  │
   │ (Pode editar)                   │
   │                                 │
   │ [Cancelar] [Clonar]             │
   └─────────────────────────────────┘
   ↓
3. Editar nome se quiser (ex: DECISOR_SENIOR)
   ↓
4. Clicar [Clonar]
   ↓
5. ✅ Novo papel criado como cópia!
   (Mesmas permissões do original)
   ↓
6. Agora você pode editar as permissões do clone
```

---

## 📊 Matriz de Permissões

A matriz interativa permite selecionar permissões facilmente:

```
┌────────────────┬────┬────┬────┬────┬────┐
│ Recurso        │ ➕ │ 👁️ │ ✏️ │ 🗑️ │ 📤 │
│ (Criar) (Ler) (Atualizar) (Deletar) (Exportar)
├────────────────┼────┼────┼────┼────┼────┤
│ Projetos       │ ☑️  │ ☑️  │ ☑️  │    │ ☑️  │
│ Critérios      │    │ ☑️  │    │    │    │
│ Avaliações     │ ☑️  │ ☑️  │ ☑️  │    │ ☑️  │
│ Resultados     │    │ ☑️  │    │    │ ☑️  │
│ Usuários       │    │    │    │    │    │
│ Permissões     │    │    │    │    │    │
└────────────────┴────┴────┴────┴────┴────┘

Toolbar superior:
[Criar Tudo] [Ler Tudo] [Atualizar Tudo] [Deletar Tudo] [Exportar Tudo]
```

### Legenda de Ações

| Ícone | Sigla | Ação | Descrição |
|-------|-------|------|-----------|
| ➕ | C | CREATE | Criar novo recurso |
| 👁️ | R | READ | Visualizar/listar |
| ✏️ | U | UPDATE | Editar/atualizar |
| 🗑️ | D | DELETE | Deletar |
| 📤 | E | EXPORT | Exportar dados |

---

## 🔍 Filtros e Busca

### Buscar por Nome

```
[Buscar papel...] ← Digite para filtrar
```

Procura por:
- Nome do papel (ex: CUSTOM_ANALYST)
- Rótulo (ex: Analista Customizado)
- Descrição

### Filtrar por Tipo

```
[Todos] ← Mostra tudo
[✅ Apenas Sistema] ← Mostra só papéis ADMIN/DECISOR/ANALYST/VIEWER
```

---

## 📋 Informações de Cada Papel

### Na Tabela

```
Nome         → Identifica único + rótulo visual
Descrição    → Explica o propósito (2 linhas máx)
Permissões   → Número total (ex: 14)
Sistema      → ✓ se for papel padrão, - se customizado
Ações        → ✏️ Editar, 🗂️ Clonar, 🗑️ Deletar
```

### No Modal (Editando)

```
Nome         → Não editável após criação
Rótulo       → Pode mudar (ex: renomear)
Descrição    → Pode mudar
Permissões   → Matriz interativa completa
```

---

## 🎯 Casos de Uso

### Caso 1: Criar papel para QA Team

```
1. Clicar [Novo Papel ➕]
2. Preencher:
   - Nome: QA_TEAM
   - Rótulo: QA Team
   - Descrição: Time de QA - pode avaliar e ver resultados
3. Selecionar permissões:
   - ☑️ READ Projetos
   - ☑️ CREATE Avaliações
   - ☑️ READ Avaliações
   - ☑️ UPDATE Avaliações
   - ☑️ READ Resultados
   - ☑️ EXPORT Resultados
4. Clicar [Criar Papel]
5. Agora você pode atribuir este papel a usuários em /access-control
```

### Caso 2: Criar role restritivo (Supervisor)

```
1. Clicar [Novo Papel ➕]
2. Preencher:
   - Nome: SUPERVISOR
   - Rótulo: Supervisor
   - Descrição: Visualiza e valida avaliações, sem criar
3. Selecionar APENAS:
   - ☑️ READ Projetos
   - ☑️ READ Critérios
   - ☑️ READ Avaliações
   - ☑️ UPDATE Avaliações (aprovar/rejeitar)
   - ☑️ READ Resultados
4. Clicar [Criar Papel]
5. Pronto! Supervisor pode validar mas não criar
```

### Caso 3: Duplicar e customizar

```
1. Procurar DECISOR na lista
2. Clicar 🗂️ (Clonar)
3. Nome: DECISOR_LIMITED
4. Clicar [Clonar]
5. Agora editar o clone:
   - Clicar ✏️ em DECISOR_LIMITED
   - Remover permissão DELETE em Projetos
   - Salvar
6. Pronto! Você tem um Decisor limitado que não pode deletar
```

---

## 🔐 Papéis do Sistema vs Customizados

### Papéis do Sistema (Não podem ser deletados)

```
🔐 ADMIN        ← Criado pelo sistema
📊 DECISOR      ← Criado pelo sistema
🔍 ANALYST      ← Criado pelo sistema
👁️  VIEWER       ← Criado pelo sistema
```

**O que você PODE fazer:**
- ✅ Editar rótulo
- ✅ Editar descrição
- ✅ Editar permissões
- ✅ Clonar

**O que você NÃO pode fazer:**
- ❌ Deletar
- ❌ Editar nome

### Papéis Customizados (Você cria)

```
CUSTOM_QA       ← Você criou
SUPERVISOR      ← Você criou
DECISOR_LIMITED ← Você criou
```

**O que você PODE fazer:**
- ✅ Editar tudo
- ✅ Deletar
- ✅ Clonar

---

## 📚 Componentes

### RolesManager.vue
Página principal com:
- Lista de papéis
- Modais para criar/editar/deletar/clonar
- Filtros e busca
- Gerenciamento de estado

### PermissionToggleGrid.vue
Componente da matriz com:
- Checkboxes interativos
- Buttons de atalho (Criar Tudo, etc)
- Resumo de permissões selecionadas
- Remover individual

### services/api/roles.ts
API com funções:
- `getAllRoles()` - Listar todos
- `getRole(id)` - Obter um
- `createRole(input)` - Criar
- `updateRole(id, input)` - Editar
- `deleteRole(id)` - Deletar
- `cloneRole(id, newName)` - Clonar
- `getAvailablePermissions()` - Recursos e ações

---

## 🔗 Integração com Backend

O frontend está pronto, mas o backend precisa implementar:

### Mutations necessárias

```graphql
mutation createRole($input: CreateRoleInput!) {
  createRole(input: $input) {
    id name label description
    permissions { resource action }
    isSystem createdAt updatedAt
  }
}

mutation updateRole($id: ID!, $input: UpdateRoleInput!) {
  updateRole(id: $id, input: $input) {
    id name label description
    permissions { resource action }
    isSystem createdAt updatedAt
  }
}

mutation deleteRole($id: ID!) {
  deleteRole(id: $id)
}

mutation cloneRole($id: ID!, $newName: String!) {
  cloneRole(id: $id, newName: $newName) {
    id name label description
    permissions { resource action }
    isSystem createdAt updatedAt
  }
}
```

### Queries necessárias

```graphql
query {
  allRoles {
    id name label description
    permissions { resource action }
    isSystem createdAt updatedAt
  }
}

query role($id: ID!) {
  role(id: $id) {
    id name label description
    permissions { resource action }
    isSystem createdAt updatedAt
  }
}

query {
  availablePermissions {
    resources
    actions
    actionLabels
    resourceLabels
  }
}
```

---

## 🚀 Próximos Passos

### Frontend (✅ PRONTO)
- [x] Página RolesManager
- [x] Componente PermissionToggleGrid
- [x] API roles.ts
- [x] UI completa

### Backend (❌ TODO)
- [ ] Modelo CustomRole no banco
- [ ] Mutations para CRUD
- [ ] Queries
- [ ] Validações
- [ ] Permissões de quem pode gerenciar

---

## 📖 Documentação Relacionada

- [ADMIN_VISUAL_GUIDE.md](../ADMIN_VISUAL_GUIDE.md) - Visão geral dos 3 painéis
- [QUICK_ADMIN_GUIDE.md](../QUICK_ADMIN_GUIDE.md) - Rápido
- [PERMISSIONS_MODULE.md](../PERMISSIONS_MODULE.md) - Arquitetura completa

---

**Pronto para criar papéis customizados! 🎉**
