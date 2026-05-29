# 🔐 Painel de Administração de Permissões

Documentação prática para gerenciar permissões e controle de acesso no frontend.

## 📍 Onde Está?

### Página de Gerenciamento de Acesso
- **Arquivo**: `apps/frontend/src/pages/AccessControl.vue`
- **Rota**: `/access-control` (apenas ADMIN)
- **Funcionalidade**: Gerenciar papéis e permissões dos usuários

### Página de Dashboard de Permissões
- **Arquivo**: `apps/frontend/src/pages/PermissionsAdmin.vue`
- **Rota**: `/permissions-admin` (apenas ADMIN)
- **Funcionalidade**: Visualizar matriz de permissões e estatísticas

### Página de Usuários (Atualizada)
- **Arquivo**: `apps/frontend/src/pages/Users.vue`
- **Rota**: `/users` (apenas ADMIN)
- **Funcionalidade**: Criar/editar usuários com novo role ANALYST

---

## 🎯 Como Usar

### 1. Acessar o Painel

**Opção A: Página de Controle de Acesso** (Recomendado)
1. Fazer login como ADMIN
2. Ir para `/access-control`
3. Você verá:
   - Tabela com todos os usuários
   - Papel atual de cada usuário
   - Ícones das permissões (C, R, U, D, E)
   - Botão "Gerenciar" para cada usuário

**Opção B: Página de Dashboard de Permissões**
1. Fazer login como ADMIN
2. Ir para `/permissions-admin`
3. Você verá:
   - Matriz de permissões (Recursos × Papéis)
   - Permissões por papel
   - Estatísticas de usuários

**Opção C: Página de Usuários**
1. Fazer login como ADMIN
2. Ir para `/users`
3. Clicar em "Editar" para um usuário
4. Selecionar novo papel

---

## 👥 Papéis Disponíveis

### 🔐 ADMIN - Administrador
- **Acesso**: Total
- **Usa para**: Gerentes TI, Administradores do Sistema
- **Permissões**:
  - ✅ Criar, Ler, Atualizar, Deletar TUDO
  - ✅ Gerenciar Usuários
  - ✅ Gerenciar Permissões

### 📊 DECISOR - Tomador de Decisão
- **Acesso**: Criar e gerenciar projetos
- **Usa para**: Executivos, Gerentes de Projeto
- **Permissões**:
  - ✅ C, R, U em: Projetos, Critérios, Avaliações
  - ✅ R, E em: Resultados
  - ❌ Não pode: Gerenciar usuários, deletar recursos

### 🔍 ANALYST - Analista (NOVO!)
- **Acesso**: Visualizar e criar avaliações
- **Usa para**: Analistas de Dados, Pesquisadores
- **Permissões**:
  - ✅ R em: Projetos, Critérios
  - ✅ C, R, U em: Avaliações
  - ✅ R, E em: Resultados
  - ❌ Não pode: Criar projetos, deletar

### 👁️ VIEWER - Visualizador
- **Acesso**: Apenas leitura
- **Usa para**: Stakeholders, Consultores Externos
- **Permissões**:
  - ✅ R em: Projetos, Critérios, Avaliações, Resultados
  - ✅ E em: Resultados
  - ❌ Não pode: Criar nada, editar, deletar

---

## 🔄 Fluxo: Atribuir um Papel a um Usuário

### No Painel de Controle de Acesso

```
1. Ir para /access-control
   ↓
2. Procurar o usuário na lista
   ↓
3. Clicar em "Gerenciar"
   ↓
4. Modal abre mostrando:
   - Nome e email do usuário
   - Opções de papel (ADMIN, DECISOR, ANALYST, VIEWER)
   - Lista de permissões do papel selecionado
   - Toggle para Ativo/Inativo
   ↓
5. Selecionar novo papel
   ↓
6. A lista de permissões atualiza automaticamente
   ↓
7. Clicar em "Salvar Alterações"
   ↓
8. Mensagem de sucesso aparece
```

### No Painel de Usuários

```
1. Ir para /users
   ↓
2. Procurar o usuário
   ↓
3. Clicar no ícone de edição (✏️)
   ↓
4. Modal abre com:
   - Nome, Email, Senha (se novo)
   - Seletor de Papel (ADMIN, DECISOR, ANALYST, VIEWER)
   - Toggle Ativo/Inativo
   ↓
5. Selecionar novo papel (4 opções com ícones)
   ↓
6. Clicar "Salvar Alterações"
   ↓
7. Usuário é atualizado
```

---

## 📊 Matriz de Permissões

### Visualizar Matriz Completa

**Arquivo**: `/permissions-admin`

A matriz mostra:
- **Linhas**: Recursos (Projetos, Critérios, Avaliações, Resultados, Usuários, Permissões)
- **Colunas**: Papéis (ADMIN, DECISOR, ANALYST, VIEWER)
- **Células**: Ações permitidas com ícones

### Legenda de Ações

| Ícone | Ação | Descrição |
|-------|------|-----------|
| C | CREATE | Criar novo recurso |
| R | READ | Visualizar/listar |
| U | UPDATE | Editar/atualizar |
| D | DELETE | Deletar |
| E | EXPORT | Exportar dados |

---

## 🎛️ Componentes Criados

### `AccessControl.vue`
- Página principal de gerenciamento de acesso
- Tabela com todos os usuários
- Modal para atribuir papéis
- Mostra permissões do papel selecionado

### `PermissionsAdmin.vue`
- Dashboard de permissões
- 3 abas: Matriz, Papéis, Auditoria
- Matriz visual de Resources × Roles
- Estatísticas de usuários

### `PermissionCell.vue`
- Componente que mostra permissões em uma célula
- Exibe ícones (C, R, U, D, E)
- Com cores diferentes por ação

### `RoleBadge.vue`
- Badge visual do papel
- Com ícone e cor
- Reutilizável em vários componentes

### `permissionMatrix.ts`
- Espelha a matriz de permissões do backend
- Funções: `hasPermission()`, `getPermissionsForRole()`, etc.
- Manter sincronizado com backend!

---

## 🔗 Integração com Backend

### API de Permissões

**Arquivo**: `apps/frontend/src/services/api/permissions.ts`

Métodos disponíveis:

```typescript
// Obter permissões de um papel
getRolePermissions(role: UserRole): Promise<RolePermissions>

// Obter todos os papéis com permissões
getAllRolePermissions(): Promise<RolePermissions[]>

// Obter permissões do usuário atual
getUserPermissions(): Promise<Permission[]>

// Verificar se usuário tem permissão
checkPermission(resource, action): Promise<boolean>

// Obter matriz completa
getPermissionMatrix(): Promise<PermissionMatrix>

// Obter estatísticas
getPermissionStats(): Promise<PermissionStats>
```

---

## 🚀 Roteiros de Uso

### Cenário 1: Criar novo Analista

```
1. Ir para /users
2. Clicar "Novo Decisor"
3. Preencher: Nome, Email, Senha
4. Selecionar papel "ANALYST"
5. Clicar "Criar Decisor"
6. Pronto! Analista criado com permissões certas
```

### Cenário 2: Promover Visualizador para Decisor

```
1. Ir para /access-control
2. Procurar usuário VIEWER
3. Clicar "Gerenciar"
4. Mudar papel de VIEWER para DECISOR
5. Ver permissões atualizarem (agora tem CREATE, UPDATE, DELETE)
6. Clicar "Salvar Alterações"
7. Pronto! Usuário agora pode criar projetos
```

### Cenário 3: Desativar usuário temporariamente

```
1. Ir para /access-control
2. Procurar usuário
3. Clicar "Gerenciar"
4. Desativar toggle "Ativo"
5. Clicar "Salvar Alterações"
6. Usuário não consegue mais fazer login
```

### Cenário 4: Visualizar todas as permissões

```
1. Ir para /permissions-admin
2. Clicar aba "Matriz de Permissões"
3. Ver quadro completo: quem pode fazer o quê
4. Clicar aba "Permissões por Papel" para ver em detalhe
5. Clicar aba "Auditoria" para ver logs (em breve)
```

---

## ⚙️ Configuração no Router

Se quiser adicionar as rotas ao `router/index.ts`:

```typescript
import { createPermissionGuards, withRole } from '@/composables/useRoutePermissions'
import { UserRole } from '@/services/api/users'
import AccessControl from '@/pages/AccessControl.vue'
import PermissionsAdmin from '@/pages/PermissionsAdmin.vue'

const routes = [
  {
    path: '/access-control',
    component: AccessControl,
    meta: withRole(UserRole.ADMIN),
    name: 'AccessControl',
  },
  {
    path: '/permissions-admin',
    component: PermissionsAdmin,
    meta: withRole(UserRole.ADMIN),
    name: 'PermissionsAdmin',
  },
  // ...outras rotas
]

createPermissionGuards(router)
```

---

## 🔐 Segurança

### Frontend
- ✅ Páginas protegidas (apenas ADMIN acessa)
- ✅ Modais escondem opções de papel se não for ADMIN
- ✅ Botões desabilitados se sem permissão

### Backend
- ✅ **CRÍTICO**: Backend verifica SEMPRE
- ✅ `verifyPermission()` em cada resolver
- ✅ JWT contém role do usuário
- ✅ Não confiar apenas no frontend!

---

## 📝 Checklist de Uso

- [ ] Login como ADMIN
- [ ] Ir para `/access-control`
- [ ] Ver lista de usuários
- [ ] Clicar "Gerenciar" em um usuário
- [ ] Mudar papel
- [ ] Ver permissões atualizarem
- [ ] Salvar alterações
- [ ] Ir para `/permissions-admin`
- [ ] Ver matriz completa
- [ ] Verificar que mudança aparece na matriz

---

## 🆘 Troubleshooting

### "Forbidden: Admin access required"
- **Problema**: Usuário não é ADMIN
- **Solução**: Login como admin@tcc.local / Decisor@123

### Página branca ao acessar
- **Problema**: Componentes faltando
- **Solução**: Verificar imports, rodar `npm install`

### Permissões não atualizam
- **Problema**: Frontend não sincronizado com backend
- **Solução**: Verificar `permissionMatrix.ts` vs backend `rbac.policies.ts`

### Mudanças não salvam
- **Problema**: Erro na API
- **Solução**: Verificar console, ver mensagem de erro

---

## 📚 Referências

- [PERMISSIONS_MODULE.md](../PERMISSIONS_MODULE.md) - Documentação completa
- [Backend Permissions](../apps/backend/src/modules/permissions/) - Código backend
- [Frontend Composables](../apps/frontend/src/composables/) - usePermissions, etc.
