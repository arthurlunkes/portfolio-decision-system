# ⚡ Gerenciador de Papéis - Guia Rápido

## 🎯 TL;DR

Nova página para **criar, editar, deletar e customizar papéis** com suas permissões.

---

## 📍 Onde?

- **URL**: `/roles` ou `/roles-manager`
- **Apenas ADMIN** consegue acessar
- **Novo componente**: `RolesManager.vue`

---

## 🎬 Usar em 30 segundos

### Criar novo papel

```
1. Clicar [Novo Papel ➕]
2. Preencher:
   - Nome: EX_CUSTOM_QA
   - Rótulo: QA Customizado
   - Descrição: Team de testes...
3. Marcar permissões (matriz interativa):
   ☑️ Ler Projetos
   ☑️ Criar Avaliações
   ☑️ Ler Resultados
   ☑️ Exportar Resultados
4. Clicar [Criar Papel]
5. ✅ Pronto! Papel criado
```

### Editar papel

```
1. Clicar ✏️ no papel
2. Mudar rótulo/descrição/permissões
3. Clicar [Salvar Alterações]
```

### Deletar papel

```
1. Clicar 🗑️ no papel
2. Confirmar
3. ❌ Papel deletado
```

### Clonar papel

```
1. Clicar 🗂️ no papel
2. Digitar novo nome
3. Clicar [Clonar]
4. ✅ Novo papel criado como cópia
5. Editar e customizar
```

---

## 🔍 Matriz de Permissões

```
Recurso      │ ➕(C) │ 👁️(R) │ ✏️(U) │ 🗑️(D) │ 📤(E) │
─────────────┼───────┼───────┼───────┼───────┼───────┤
Projetos     │   ☑️   │   ☑️   │   ☑️   │       │   ☑️   │
Critérios    │   ☑️   │   ☑️   │   ☑️   │       │       │
Avaliações   │   ☑️   │   ☑️   │   ☑️   │       │   ☑️   │
Resultados   │       │   ☑️   │       │       │   ☑️   │
Usuários     │       │       │       │       │       │
Permissões   │       │       │       │       │       │

Legend:
➕ = Criar
👁️ = Ler
✏️ = Atualizar
🗑️ = Deletar
📤 = Exportar
```

### Atalhos

```
[Criar Tudo]     ← Marcar CREATE em tudo
[Ler Tudo]       ← Marcar READ em tudo
[Atualizar Tudo] ← Marcar UPDATE em tudo
[Deletar Tudo]   ← Marcar DELETE em tudo
[Exportar Tudo]  ← Marcar EXPORT em tudo
```

---

## 🎭 Papéis do Sistema vs Customizados

### Do Sistema (NÃO deletável)

```
🔐 ADMIN, 📊 DECISOR, 🔍 ANALYST, 👁️ VIEWER
```

**Pode**: Editar nome/descrição/permissões, Clonar
**Não pode**: Deletar

### Customizados (Você cria)

```
QA_TEAM, SUPERVISOR, DECISOR_LIMITED, etc
```

**Pode**: Editar TUDO, Clonar, Deletar
**Não pode**: Nada! Você é o dono

---

## 📊 Tabela Principal

```
Nome         │ Descrição      │ Permissões │ Sistema │ Ações
─────────────┼────────────────┼────────────┼─────────┼──────────
🔐 Admin     │ Acesso total   │    14      │    ✓    │ ✏️ 🗂️
📊 Decisor   │ Criar projetos │    10      │    ✓    │ ✏️ 🗂️
QA_TEAM      │ QA customizado │     6      │    —    │ ✏️ 🗂️ 🗑️
```

---

## 🔗 Integração com Access Control

Após criar um papel aqui:

1. Ir para `/access-control`
2. Ver o novo papel na lista de papéis
3. Atribuir para usuários

---

## 📚 Componentes

| Arquivo | Função |
|---------|--------|
| `RolesManager.vue` | Página principal (CRUD) |
| `PermissionToggleGrid.vue` | Matriz interativa |
| `services/api/roles.ts` | API |

---

## 🆘 Problemas?

| Problema | Solução |
|----------|---------|
| Não vejo /roles | Login como ADMIN |
| Papel não salva | Verificar console (F12) |
| Permissões não atualizam | Recarregar página |
| Não consigo deletar | É papel do sistema (ADMIN/DECISOR/etc) |

---

## 📖 Documentação Completa

[ROLES_MANAGER_GUIDE.md](ROLES_MANAGER_GUIDE.md) - Documentação detalhada

---

**Agora você controla os papéis! 🎉**
