<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Cabeçalho -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Gerenciador de Acesso
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Atribua papéis aos usuários e controle suas permissões
          </p>
        </div>

        <AppAlert v-if="errorMessage" variant="error" :message="errorMessage" />
        <AppAlert
          v-if="successMessage"
          variant="success"
          :message="successMessage"
        />

        <!-- Filtros -->
        <div
          class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4"
        >
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <AppInput
                v-model="searchTerm"
                placeholder="Buscar usuário por nome ou e-mail..."
                type="text"
              />
            </div>
            <div class="flex gap-2">
              <button
                v-for="role in filterRoles"
                :key="role.value"
                @click="selectedRoleFilter = role.value"
                class="px-4 py-2 text-sm font-medium rounded-xl border transition-colors"
                :class="
                  selectedRoleFilter === role.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                "
              >
                {{ role.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabela de Usuários com Permissões -->
        <div
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div class="px-6 py-4 border-b border-gray-100">
            <h2
              class="text-sm font-semibold text-gray-400 uppercase tracking-wider"
            >
              Usuários ({{ filteredUsers.length }})
            </h2>
          </div>

          <div v-if="loading" class="px-6 py-12 text-center">
            <p class="text-gray-500">Carregando usuários...</p>
          </div>

          <div
            v-else-if="filteredUsers.length === 0"
            class="px-6 py-12 text-center"
          >
            <p class="text-gray-500">Nenhum usuário encontrado</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50/60">
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Usuário
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Papel Atual
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Permissões
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="user in filteredUsers"
                  :key="user.id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <AppAvatar :name="user.name" size="md" />
                      <div>
                        <p class="text-sm font-semibold text-gray-900">
                          {{ user.name }}
                        </p>
                        <p class="text-xs text-gray-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <RoleBadge :role="user.role" />
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="icon in getPermissionIcons(user.role)"
                        :key="icon"
                        class="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded"
                        :class="getIconColor(icon)"
                        :title="getIconTitle(icon)"
                      >
                        {{ icon }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="
                        user.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      "
                    >
                      {{ user.active ? "Ativo" : "Inativo" }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <button
                      @click="openPermissionModal(user)"
                      class="px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal: Gerenciar Permissões do Usuário -->
    <AppModal
      v-model="showPermissionModal"
      :title="`Gerenciar Acesso: ${selectedUser?.name}`"
      size="lg"
    >
      <div v-if="selectedUser" class="space-y-6">
        <!-- Info do Usuário -->
        <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <AppAvatar :name="selectedUser.name" size="sm" />
          <div>
            <p class="text-sm font-semibold text-gray-900">
              {{ selectedUser.name }}
            </p>
            <p class="text-xs text-gray-500">{{ selectedUser.email }}</p>
          </div>
        </div>

        <!-- Seleção de Papel -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-3"
            >Papel</label
          >
          <div class="grid grid-cols-2 gap-3">
            <label
              v-for="role in availableRoles"
              :key="role"
              class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all"
              :class="
                selectedUser.role === role
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              "
            >
              <input
                v-model="selectedUser.role"
                type="radio"
                :value="role"
                class="sr-only"
              />
              <RoleBadge :role="role" />
            </label>
          </div>
        </div>

        <!-- Permissões do Papel Selecionado -->
        <div>
          <label class="block text-sm font-semibold text-gray-900 mb-3">
            Permissões do Papel "{{ roleLabel(selectedUser.role) }}"
          </label>
          <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto"
          >
            <div
              v-for="(perm, idx) in getPermissionsForRole(selectedUser.role)"
              :key="idx"
              class="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <svg
                class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              <div class="text-sm">
                <p class="font-medium text-gray-900">
                  {{ actionLabel(perm.action) }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ resourceLabel(perm.resource) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Ativo/Inativo -->
        <div
          class="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">Ativo</p>
            <p class="text-xs text-gray-500">Permite acesso ao sistema</p>
          </div>
          <AppToggle v-model="selectedUser.active" />
        </div>

        <!-- Ações -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <AppButton variant="secondary" @click="showPermissionModal = false">
            Cancelar
          </AppButton>
          <AppButton variant="primary" @click="savePermissions">
            Salvar Alterações
          </AppButton>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppAlert from "@/components/ui/AppAlert.vue";
import AppAvatar from "@/components/ui/AppAvatar.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppModal from "@/components/ui/AppModal.vue";
import AppToggle from "@/components/ui/AppToggle.vue";
import { Action, Resource } from "@/services/api/permissions";
import type { User, UserRole } from "@/services/api/users";
import { getUsers, updateUser } from "@/services/api/users";
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref } from "vue";
import { ROLE_PERMISSIONS } from "./components/permissionMatrix";
import RoleBadge from "./components/RoleBadge.vue";

const authStore = useAuthStore();

const users = ref<User[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const searchTerm = ref("");
const selectedRoleFilter = ref<"all" | UserRole>("all");
const selectedUser = ref<User | null>(null);
const showPermissionModal = ref(false);

const availableRoles: UserRole[] = ["ADMIN", "DECISOR", "ANALYST", "VIEWER"];

const filterRoles = [
  { value: "all" as const, label: "Todos" },
  { value: "ADMIN" as const, label: "Admin" },
  { value: "DECISOR" as const, label: "Decisores" },
  { value: "ANALYST" as const, label: "Analistas" },
  { value: "VIEWER" as const, label: "Visualizadores" },
];

const filteredUsers = computed(() =>
  users.value.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesRole =
      selectedRoleFilter.value === "all" || u.role === selectedRoleFilter.value;
    return matchesSearch && matchesRole;
  }),
);

onMounted(async () => {
  loading.value = true;
  try {
    users.value = await getUsers();
  } catch (error: any) {
    errorMessage.value = "Erro ao carregar usuários";
  } finally {
    loading.value = false;
  }
});

const roleLabel = (role: UserRole) => {
  const labels: Record<UserRole, string> = {
    ADMIN: "Administrador",
    DECISOR: "Decisor",
    ANALYST: "Analista",
    VIEWER: "Visualizador",
  };
  return labels[role];
};

const resourceLabel = (resource: Resource): string => {
  const labels: Record<Resource, string> = {
    PROJECTS: "Projetos",
    CRITERIA: "Critérios",
    EVALUATIONS: "Avaliações",
    RESULTS: "Resultados",
    USERS: "Usuários",
    PERMISSIONS: "Permissões",
  };
  return labels[resource];
};

const actionLabel = (action: Action): string => {
  const labels: Record<Action, string> = {
    CREATE: "Criar",
    READ: "Ler",
    UPDATE: "Atualizar",
    DELETE: "Deletar",
    EXPORT: "Exportar",
    VIEW_RESULTS: "Ver Resultados",
    MANAGE_USERS: "Gerenciar Usuários",
    MANAGE_PERMISSIONS: "Gerenciar Permissões",
  };
  return labels[action];
};

const getPermissionsForRole = (role: UserRole) => {
  return ROLE_PERMISSIONS[role];
};

const getPermissionIcons = (role: UserRole): string[] => {
  const actions = new Set<string>();
  const perms = ROLE_PERMISSIONS[role];

  perms.forEach((p) => {
    if (p.action === Action.CREATE) actions.add("C");
    else if (p.action === Action.READ) actions.add("R");
    else if (p.action === Action.UPDATE) actions.add("U");
    else if (p.action === Action.DELETE) actions.add("D");
    else if (p.action === Action.EXPORT) actions.add("E");
  });

  return Array.from(actions).sort();
};

const getIconColor = (icon: string): string => {
  const colors: Record<string, string> = {
    C: "bg-green-100 text-green-700",
    R: "bg-blue-100 text-blue-700",
    U: "bg-yellow-100 text-yellow-700",
    D: "bg-red-100 text-red-700",
    E: "bg-purple-100 text-purple-700",
  };
  return colors[icon] || "bg-gray-100 text-gray-700";
};

const getIconTitle = (icon: string): string => {
  const titles: Record<string, string> = {
    C: "Criar",
    R: "Ler",
    U: "Atualizar",
    D: "Deletar",
    E: "Exportar",
  };
  return titles[icon] || "";
};

const openPermissionModal = (user: User) => {
  selectedUser.value = { ...user };
  showPermissionModal.value = true;
};

const savePermissions = async () => {
  if (!selectedUser.value) return;

  errorMessage.value = "";
  successMessage.value = "";

  try {
    const updated = await updateUser(selectedUser.value.id, {
      name: selectedUser.value.name,
      email: selectedUser.value.email,
      role: selectedUser.value.role,
      active: selectedUser.value.active,
    });

    const idx = users.value.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      users.value[idx] = updated;
    }

    successMessage.value = `Permissões de ${selectedUser.value.name} atualizadas com sucesso!`;
    showPermissionModal.value = false;
  } catch (error: any) {
    errorMessage.value = error.message ?? "Erro ao salvar permissões";
  }
};
</script>
