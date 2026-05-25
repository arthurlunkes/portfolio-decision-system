<!-- Frontend Permissions Module Usage Guide -->

<!-- EXEMPLO 1: Usar usePermissions em um componente -->
<template>
  <div class="projects-page">
    <!-- Mostrar botão de criar apenas se o usuário tiver permissão -->
    <button
      v-if="canCreate(Resource.PROJECTS)"
      @click="openCreateDialog"
      class="btn btn-primary"
    >
      Create Project
    </button>

    <!-- Mostrar botão de exportar apenas se o usuário tiver permissão -->
    <button
      v-if="canExport(Resource.PROJECTS)"
      @click="exportProjects"
      class="btn btn-secondary"
    >
      Export Projects
    </button>

    <!-- Lista de projetos (visivelmente para todos que podem READ) -->
    <div v-if="canRead(Resource.PROJECTS)" class="projects-list">
      <div v-for="project in projects" :key="project.id" class="project-card">
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>

        <!-- Mostrar botões de ação baseado em permissões -->
        <div class="actions">
          <button
            v-if="canUpdate(Resource.PROJECTS)"
            @click="editProject(project)"
            class="btn btn-sm btn-secondary"
          >
            Edit
          </button>
          <button
            v-if="canDelete(Resource.PROJECTS)"
            @click="deleteProject(project.id)"
            class="btn btn-sm btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Mensagem de acesso negado -->
    <div v-else class="alert alert-warning">
      You don't have permission to view projects.
    </div>

    <!-- Seção administrativa -->
    <div v-if="isAdmin" class="admin-section">
      <h2>Admin Panel</h2>
      <!-- Conteúdo admin -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { Action, Resource, usePermissions } from "@/composables/usePermissions";
import { ref } from "vue";

const { can, canCreate, canRead, canUpdate, canDelete, canExport, isAdmin } =
  usePermissions();

const projects = ref([]);

// Método pode ser chamado normalmente - o check de permissão é automático na UI
const openCreateDialog = () => {
  console.log("Opening create dialog");
};

const editProject = (project: any) => {
  console.log("Editing project:", project);
};

const deleteProject = (projectId: string) => {
  console.log("Deleting project:", projectId);
};

const exportProjects = () => {
  console.log("Exporting projects");
};
</script>

<!-- EXEMPLO 2: Usar usePermissionUI para casos avançados -->
<template>
  <div class="criteria-page">
    <template v-if="canShowReadContent">
      <!-- Use getAvailableActions() para construir menus dinâmicos -->
      <div class="toolbar">
        <button
          v-if="canShowCreateButton"
          @click="createCriterion"
          class="btn btn-primary"
        >
          + Add Criterion
        </button>
        <button
          v-if="canShowExportButton"
          @click="exportCriteria"
          class="btn btn-secondary"
        >
          Export
        </button>
      </div>

      <!-- Aplicar classes de permissão -->
      <div :class="['criteria-container', getPermissionClasses()]">
        <div
          v-for="criterion in criteria"
          :key="criterion.id"
          class="criterion-item"
        >
          <h4>{{ criterion.name }}</h4>

          <!-- Mostrar ações baseadas em permissões disponíveis -->
          <div v-if="getAvailableActions().length > 0" class="actions">
            <button
              v-if="canPerform(Action.UPDATE)"
              @click="editCriterion(criterion)"
              class="btn-icon"
            >
              ✏️
            </button>
            <button
              v-if="canPerform(Action.DELETE)"
              @click="deleteCriterion(criterion.id)"
              class="btn-icon btn-danger"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="alert alert-info">
        You don't have permission to view criteria.
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  usePermissionUI,
  Resource,
  Action,
} from "@/composables/usePermissionUI";

const {
  canShowCreateButton,
  canShowReadContent,
  canShowEditButton,
  canShowDeleteButton,
  canShowExportButton,
  canPerform,
  getAvailableActions,
  getPermissionClasses,
} = usePermissionUI(Resource.CRITERIA);

const criteria = ref([]);

const createCriterion = () => console.log("Creating criterion");
const editCriterion = (criterion: any) => console.log("Editing:", criterion);
const deleteCriterion = (id: string) => console.log("Deleting:", id);
const exportCriteria = () => console.log("Exporting criteria");
</script>

<!-- EXEMPLO 3: Usar em definições de rotas -->
<script>
import { UserRole } from "@/composables/usePermissions";
import {
  createPermissionGuards,
  withAuth,
  withPermission,
  withRole,
} from "@/composables/useRoutePermissions";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/pages/Login.vue"),
      name: "Login",
    },
    {
      path: "/dashboard",
      component: () => import("@/pages/Dashboard.vue"),
      name: "Dashboard",
      meta: withAuth(), // Requer autenticação
    },
    {
      path: "/projects",
      component: () => import("@/pages/Projects.vue"),
      name: "Projects",
      meta: withPermission(Resource.PROJECTS, Action.READ), // Requer permissão READ em PROJECTS
    },
    {
      path: "/projects/create",
      component: () => import("@/pages/ProjectCreate.vue"),
      name: "ProjectCreate",
      meta: withPermission(Resource.PROJECTS, Action.CREATE), // Requer permissão CREATE
    },
    {
      path: "/criteria",
      component: () => import("@/pages/Criteria.vue"),
      name: "Criteria",
      meta: withPermission(Resource.CRITERIA, Action.READ),
    },
    {
      path: "/evaluations",
      component: () => import("@/pages/Evaluations.vue"),
      name: "Evaluations",
      meta: withPermission(Resource.EVALUATIONS, Action.READ),
    },
    {
      path: "/results",
      component: () => import("@/pages/Results.vue"),
      name: "Results",
      meta: withPermission(Resource.RESULTS, Action.VIEW_RESULTS),
    },
    {
      path: "/users",
      component: () => import("@/pages/Users.vue"),
      name: "Users",
      meta: withRole(UserRole.ADMIN), // Apenas admins
    },
    {
      path: "/admin",
      component: () => import("@/pages/Admin.vue"),
      name: "Admin",
      meta: {
        requiresAuth: true,
        roles: [UserRole.ADMIN], // Apenas admin
      },
    },
  ],
});

// Aplicar guards de permissão
createPermissionGuards(router);

export default router;
</script>

<!-- EXEMPLO 4: Componente para inicializar permissões após login -->
<template>
  <div>
    <!-- Usar após fazer login com sucesso -->
  </div>
</template>

<script setup lang="ts">
import { usePermissions, UserRole } from "@/composables/usePermissions";

const { initializePermissions, clearPermissions } = usePermissions();

// Após login bem-sucedido (no serviço de auth):
export function handleLoginSuccess(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}) {
  initializePermissions(user.role, user.id, user.email);

  // Navegar para dashboard
  router.push("/dashboard");
}

// No logout:
export function handleLogout() {
  clearPermissions();
  router.push("/login");
}
</script>

<!-- EXEMPLO 5: Componente com verificações mais complexas -->
<template>
  <div class="users-page">
    <h1>Users Management</h1>

    <!-- Mostrar apenas para admin -->
    <div v-if="isAdmin" class="users-table">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th v-if="canShowEditButton" class="actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <!-- Mostrar dropdown de roles apenas se tiver permissão -->
              <select
                v-if="canManageUsers"
                v-model="user.role"
                @change="updateUserRole(user.id, user.role)"
              >
                <option value="VIEWER">Viewer</option>
                <option value="ANALYST">Analyst</option>
                <option value="DECISOR">Decisor</option>
                <option value="ADMIN">Admin</option>
              </select>
              <span v-else>{{ user.role }}</span>
            </td>
            <td v-if="canShowEditButton" class="actions">
              <button
                v-if="canShowEditButton"
                @click="editUser(user)"
                class="btn-sm"
              >
                Edit
              </button>
              <button
                v-if="canShowDeleteButton"
                @click="deleteUser(user.id)"
                class="btn-sm btn-danger"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="alert alert-danger">
      You don't have permission to access this page.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePermissions, Resource, Action } from "@/composables/usePermissions";
import { usePermissionUI } from "@/composables/usePermissionUI";

const { isAdmin, can } = usePermissions();
const { canShowEditButton, canShowDeleteButton } = usePermissionUI(
  Resource.USERS,
);

const users = ref([]);

// Verificar se pode gerenciar usuários (mudar roles)
const canManageUsers = computed(() => can(Resource.USERS, Action.MANAGE_USERS));

const editUser = (user: any) => console.log("Editing user:", user);
const deleteUser = (userId: string) => console.log("Deleting user:", userId);
const updateUserRole = (userId: string, newRole: string) =>
  console.log("Updating role:", userId, newRole);
</script>
