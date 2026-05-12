<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Cabeçalho -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Decisores</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Gerencie os usuários que participam das avaliações
        </p>
      </div>

      <AppAlert v-if="pageError" variant="error" :message="pageError" />

      <!-- Filtros e busca -->
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4"
      >
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <AppInput
              v-model="searchTerm"
              placeholder="Buscar por nome ou e-mail..."
              type="text"
            />
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="filter in roleFilters"
              :key="filter.value"
              type="button"
              class="px-4 py-2.5 text-sm font-medium rounded-xl border transition-colors duration-150"
              :class="
                activeRoleFilter === filter.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              "
              @click="activeRoleFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
        >
          <h2
            class="text-sm font-semibold text-gray-400 uppercase tracking-wider"
          >
            Usuários ({{ filteredUsers.length }})
          </h2>
          <AppButton variant="primary" size="sm" @click="openAddModal">
            Novo Decisor
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </AppButton>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/60">
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Decisor
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Papel
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Criado em
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
                class="hover:bg-gray-50/60 transition-colors"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <AppAvatar :name="user.name" size="md" />
                    <div>
                      <p class="text-sm font-semibold text-gray-900">
                        {{ user.name }}
                      </p>
                      <p class="text-xs text-gray-400">{{ user.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <AppBadge :variant="roleBadgeVariant(user.role)">
                    {{ roleLabel(user.role) }}
                  </AppBadge>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <AppToggle
                      :model-value="user.active"
                      size="sm"
                      @update:model-value="toggleActive(user)"
                    />
                    <span
                      class="text-xs font-medium"
                      :class="user.active ? 'text-green-600' : 'text-gray-400'"
                    >
                      {{ user.active ? "Ativo" : "Inativo" }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-500">{{
                    formatDate(user.createdAt)
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      class="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Editar"
                      @click="openEditModal(user)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Alterar senha"
                      @click="openPasswordModal(user)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Excluir"
                      @click="confirmDelete(user)"
                    >
                      <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filteredUsers.length === 0">
                <td
                  colspan="5"
                  class="px-6 py-12 text-center text-sm text-gray-400"
                >
                  Nenhum decisor encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </main>

    <!-- Modal: Adicionar / Editar decisor -->
    <AppModal
      v-model="showUserModal"
      :title="isEditing ? 'Editar Decisor' : 'Novo Decisor'"
    >
      <form class="space-y-4" @submit.prevent="saveUser">
        <FormField label="Nome completo" required>
          <AppInput
            v-model="userForm.name"
            placeholder="Ex.: Joao Silva"
            required
          />
        </FormField>

        <FormField label="E-mail" required>
          <AppInput
            v-model="userForm.email"
            type="email"
            placeholder="joao@empresa.com"
            required
          />
        </FormField>

        <FormField v-if="!isEditing" label="Senha inicial" required>
          <div class="relative">
            <AppInput
              v-model="userForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimo 8 caracteres"
              required
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              @click="showPassword = !showPassword"
            >
              <svg
                v-if="showPassword"
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                />
              </svg>
              <svg
                v-else
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </button>
          </div>
        </FormField>

        <FormField
          label="Papel"
          required
          :hint="
            !isAdmin && isEditing
              ? 'Apenas administradores podem alterar o papel de outros usuários.'
              : undefined
          "
        >
          <div
            class="grid grid-cols-3 gap-2"
            :class="{ 'opacity-50 pointer-events-none': !isAdmin && isEditing }"
          >
            <label
              v-for="role in roles"
              :key="role.value"
              class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all"
              :class="
                userForm.role === role.value
                  ? role.activeClass
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              "
            >
              <input
                v-model="userForm.role"
                type="radio"
                :value="role.value"
                class="sr-only"
                :disabled="!isAdmin && isEditing"
              />
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="role.icon"
                />
              </svg>
              <span class="text-xs font-semibold">{{ role.label }}</span>
            </label>
          </div>
        </FormField>

        <div
          class="flex items-center justify-between py-2 px-4 bg-gray-50 rounded-xl"
        >
          <div>
            <p class="text-sm font-medium text-gray-700">Ativo</p>
            <p class="text-xs text-gray-400">Permite acesso ao sistema</p>
          </div>
          <AppToggle v-model="userForm.active" />
        </div>

        <div class="flex justify-end gap-3 pt-1">
          <AppButton
            type="button"
            variant="secondary"
            @click="showUserModal = false"
            >Cancelar</AppButton
          >
          <AppButton type="submit" variant="primary">
            {{ isEditing ? "Salvar Alteracoes" : "Criar Decisor" }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Alterar senha -->
    <AppModal v-model="showPasswordModal" title="Alterar Senha" size="sm">
      <div
        v-if="selectedUser"
        class="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl"
      >
        <AppAvatar :name="selectedUser.name" size="sm" />
        <div>
          <p class="text-sm font-semibold text-gray-900">
            {{ selectedUser.name }}
          </p>
          <p class="text-xs text-gray-400">{{ selectedUser.email }}</p>
        </div>
      </div>

      <AppAlert v-if="passwordError" variant="error" :message="passwordError" />
      <AppAlert
        v-if="passwordSuccess"
        variant="success"
        :message="passwordSuccess"
      />

      <form class="space-y-4" @submit.prevent="savePassword">
        <FormField label="Nova Senha" required>
          <AppInput
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="Minimo 8 caracteres"
            required
          />
        </FormField>
        <FormField label="Confirmar Senha" required>
          <AppInput
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="Repita a nova senha"
            required
          />
        </FormField>
        <div class="flex justify-end gap-3 pt-1">
          <AppButton
            type="button"
            variant="secondary"
            @click="showPasswordModal = false"
            >Cancelar</AppButton
          >
          <AppButton type="submit" variant="primary">Alterar Senha</AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Confirmar exclusao -->
    <AppModal v-model="showDeleteModal" size="sm">
      <template #title>
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"
          >
            <svg
              class="w-4 h-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <span>Excluir Decisor</span>
        </div>
      </template>

      <p class="text-sm text-gray-500">
        Tem certeza que deseja excluir
        <span class="font-semibold text-gray-700">{{ userToDelete?.name }}</span
        >? Esta acao nao pode ser desfeita.
      </p>

      <div class="flex justify-end gap-3 pt-1">
        <AppButton
          type="button"
          variant="secondary"
          @click="showDeleteModal = false"
          >Cancelar</AppButton
        >
        <AppButton type="button" variant="danger" @click="deleteUser"
          >Excluir</AppButton
        >
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppAlert from "@/components/ui/AppAlert.vue";
import AppAvatar from "@/components/ui/AppAvatar.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppModal from "@/components/ui/AppModal.vue";
import AppToggle from "@/components/ui/AppToggle.vue";
import FormField from "@/components/ui/FormField.vue";
import type { User, UserRole } from "@/services/api/users";
import {
  changePassword as apiChangePassword,
  createUser as apiCreate,
  deleteUser as apiDelete,
  updateUser as apiUpdate,
  getUsers,
} from "@/services/api/users";
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref } from "vue";

const authStore = useAuthStore();
const isAdmin = computed(() => authStore.user?.role === "ADMIN");

const roles: {
  value: UserRole;
  label: string;
  icon: string;
  activeClass: string;
}[] = [
  {
    value: "ADMIN",
    label: "Admin",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    activeClass: "border-purple-500 bg-purple-50 text-purple-700",
  },
  {
    value: "DECISOR",
    label: "Decisor",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    activeClass: "border-primary-500 bg-primary-50 text-primary-700",
  },
  {
    value: "VIEWER",
    label: "Visualizador",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    activeClass: "border-gray-500 bg-gray-100 text-gray-700",
  },
];

const roleFilters = [
  { value: "all", label: "Todos" },
  { value: "ADMIN", label: "Admin" },
  { value: "DECISOR", label: "Decisores" },
  { value: "VIEWER", label: "Visualizadores" },
];

const searchTerm = ref("");
const activeRoleFilter = ref("all");
const users = ref<User[]>([]);
const pageError = ref("");

const showUserModal = ref(false);
const showPasswordModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const selectedUser = ref<User | null>(null);
const userToDelete = ref<User | null>(null);
const showPassword = ref(false);

const userForm = ref({
  id: "",
  name: "",
  email: "",
  password: "",
  role: "DECISOR" as UserRole,
  active: true,
});

const passwordForm = ref({ newPassword: "", confirmPassword: "" });
const passwordError = ref("");
const passwordSuccess = ref("");

onMounted(async () => {
  try {
    users.value = await getUsers();
  } catch {
    pageError.value = "Erro ao carregar decisores.";
  }
});

const filteredUsers = computed(() =>
  users.value.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.value.toLowerCase());
    const matchesRole =
      activeRoleFilter.value === "all" || u.role === activeRoleFilter.value;
    return matchesSearch && matchesRole;
  }),
);

const roleLabel = (role: UserRole) =>
  ({ ADMIN: "Administrador", DECISOR: "Decisor", VIEWER: "Visualizador" })[
    role
  ];

const roleBadgeVariant = (role: UserRole): "purple" | "primary" | "gray" =>
  (({ ADMIN: "purple", DECISOR: "primary", VIEWER: "gray" }) as const)[role];

const formatDate = (d: string) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
};

const openAddModal = () => {
  isEditing.value = false;
  userForm.value = {
    id: "",
    name: "",
    email: "",
    password: "",
    role: "DECISOR",
    active: true,
  };
  showPassword.value = false;
  showUserModal.value = true;
};

const openEditModal = (user: User) => {
  isEditing.value = true;
  userForm.value = { ...user, password: "" };
  showUserModal.value = true;
};

const saveUser = async () => {
  pageError.value = "";
  try {
    if (isEditing.value) {
      const updated = await apiUpdate(userForm.value.id, {
        name: userForm.value.name,
        email: userForm.value.email,
        role: userForm.value.role,
        active: userForm.value.active,
      });
      const idx = users.value.findIndex((u) => u.id === updated.id);
      if (idx !== -1) users.value[idx] = updated;
    } else {
      const created = await apiCreate({
        name: userForm.value.name,
        email: userForm.value.email,
        password: userForm.value.password,
        role: userForm.value.role,
        active: userForm.value.active,
      });
      users.value.push(created);
    }
    showUserModal.value = false;
  } catch (e: any) {
    pageError.value = e.message ?? "Erro ao salvar decisor.";
  }
};

const toggleActive = async (user: User) => {
  try {
    const updated = await apiUpdate(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
      active: !user.active,
    });
    const idx = users.value.findIndex((u) => u.id === updated.id);
    if (idx !== -1) users.value[idx] = updated;
  } catch {
    pageError.value = "Erro ao atualizar status.";
  }
};

const openPasswordModal = (user: User) => {
  selectedUser.value = user;
  passwordForm.value = { newPassword: "", confirmPassword: "" };
  passwordError.value = "";
  passwordSuccess.value = "";
  showPasswordModal.value = true;
};

const savePassword = async () => {
  passwordError.value = "";
  passwordSuccess.value = "";

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = "A senha deve ter pelo menos 8 caracteres.";
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "As senhas nao coincidem.";
    return;
  }

  try {
    if (!selectedUser.value) return;
    await apiChangePassword(
      selectedUser.value.id,
      passwordForm.value.newPassword,
    );
    passwordSuccess.value = "Senha alterada com sucesso!";
    passwordForm.value = { newPassword: "", confirmPassword: "" };
  } catch (e: any) {
    passwordError.value = e.message ?? "Erro ao alterar senha.";
  }
};

const confirmDelete = (user: User) => {
  userToDelete.value = user;
  showDeleteModal.value = true;
};

const deleteUser = async () => {
  if (!userToDelete.value) return;
  try {
    await apiDelete(userToDelete.value.id);
    users.value = users.value.filter((u) => u.id !== userToDelete.value!.id);
    showDeleteModal.value = false;
    userToDelete.value = null;
  } catch (e: any) {
    pageError.value = e.message ?? "Erro ao excluir decisor.";
    showDeleteModal.value = false;
  }
};
</script>

