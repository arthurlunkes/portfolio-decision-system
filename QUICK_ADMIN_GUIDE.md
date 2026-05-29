# ⚡ ADMIN RÁPIDO - Gerenciar Permissões em 1 minuto

## 🎯 TL;DR (Muito Longo; Não Leu)

Você tem **3 páginas de administração**:

| Página | URL | O que faz | Use quando |
|--------|-----|----------|-----------|
| **Controle de Acesso** ⭐ | `/access-control` | Mudar papel de usuários | Quer gerenciar um usuário |
| **Dashboard Permissões** | `/permissions-admin` | Ver matriz completa | Quer auditar/revisar |
| **Usuários** | `/users` | Criar/editar usuários | Quer onboarding |

---

## ⚡ Passo a Passo: Promover um Usuário

### 1. Login
```
Email: admin@tcc.local
Senha: Decisor@123
```

### 2. Ir para /access-control

### 3. Clicar "Gerenciar" no usuário

### 4. Mudar o papel
```
[🔐 Admin] [📊 Decisor] [🔍 Analista] [👁️ Viewer]
```

### 5. Clicar "Salvar Alterações"

### 6. ✅ Pronto! Usuário promovido

---

## 📍 Papéis (4 opções)

```
🔐 ADMIN         = Acesso total
📊 DECISOR       = Criar projetos
🔍 ANALYST       = Criar avaliações (NOVO!)
👁️  VIEWER       = Apenas ler
```

---

## 📊 Matriz Rápida

```
           ADMIN   DECISOR  ANALYST  VIEWER
Projetos    ✅✅    ✅      -        ✅
Critérios   ✅✅    ✅      -        ✅
Avaliações  ✅✅    ✅      ✅       ✅
Resultados  ✅     ✅      ✅       ✅

✅ = Tem permissão
```

---

## 🚀 URLs de Admin

```
/access-control     ← Mudar papéis (RECOMENDADO)
/permissions-admin  ← Ver matriz
/users              ← Criar usuários
```

---

## 🔐 Segurança

✅ Apenas ADMIN consegue acessar
✅ Backend verifica SEMPRE
✅ Mudanças são imediatas

---

## 🧪 Usuários Demo

```
admin@tcc.local     ADMIN      Decisor@123
decisor@tcc.local   DECISOR    Decisor@123
analyst@tcc.local   ANALYST    Decisor@123
viewer@tcc.local    VIEWER     Decisor@123
```

---

## 📚 Mais Info?

- [ADMIN_DASHBOARD_GUIDE.md](ADMIN_DASHBOARD_GUIDE.md) - Visual detalhado
- [FRONTEND_PERMISSIONS_ADMIN.md](FRONTEND_PERMISSIONS_ADMIN.md) - Documentação completa
- [PERMISSIONS_MODULE.md](PERMISSIONS_MODULE.md) - Arquitetura

---

**Agora você pode gerenciar permissões! 🎉**
