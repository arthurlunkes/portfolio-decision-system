<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Cabeçalho -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Gerenciador de Papéis
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Crie, edite e gerencie papéis de usuários com permissões
              customizáveis
            </p>
          </div>
          <AppButton variant="primary" size="lg" @click="openCreateModal">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Novo Papel
          </AppButton>
        </div>

        <AppAlert v-if="errorMessage" variant="error" :message="errorMessage" />
        <AppAlert
          v-if="successMessage"
          variant="success"
          :message="successMessage"
        />

        <!-- Filtros e Busca -->
        <div
          class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4"
        >
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <AppInput
                v-model="searchTerm"
                placeholder="Buscar papel por nome..."
                type="text"
              />
            </div>
            <div class="flex gap-2">
              <button
                @click="showSystemOnly = !showSystemOnly"
                class="px-4 py-2 text-sm font-medium rounded-xl border transition-colors"
                :class="
                  showSystemOnly
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                "
              >
                {{ showSystemOnly ? "✅ Apenas Sistema" : "Todos" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Tabela de Papéis -->
        <div
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div v-if="loading" class="px-6 py-12 text-center">
            <p class="text-gray-500">Carregando papéis...</p>
          </div>

          <div
            v-else-if="filteredRoles.length === 0"
            class="px-6 py-12 text-center"
          >
            <p class="text-gray-500">Nenhum papel encontrado</p>
          </div>

          <div v-else>
            <div class="overflow-x-auto">
              <table class="min-w-full">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50">
                    <th
                      class="px-6 py-3 text-left text-xs font-semibold text-gray-600"
                    >
                      Nome
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-semibold text-gray-600"
                    >
                      Descrição
                    </th>
                    <th
                      class="px-6 py-3 text-center text-xs font-semibold text-gray-600"
                    >
                      Permissões
                    </th>
                    <th
                      class="px-6 py-3 text-center text-xs font-semibold text-gray-600"
                    >
                      Sistema
                    </th>
                    <th
                      class="px-6 py-3 text-right text-xs font-semibold text-gray-600"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="role in filteredRoles"
                    :key="role.id"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-6 py-4">
                      <div>
                        <p class="text-sm font-semibold text-gray-900">
                          {{ role.label }}
                        </p>
                        <p class="text-xs text-gray-500">{{ role.name }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <p class="text-sm text-gray-600 line-clamp-2">
                        {{ role.description }}
                      </p>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span
                        class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                      >
                        {{ role.permissions.length }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <svg
                        v-if="role.isSystem"
                        class="w-5 h-5 text-gray-400 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      <span v-else class="text-gray-400">—</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <button
                          @click="openEditModal(role)"
                          class="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                          title="Editar"
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
                          @click="cloneRole(role)"
                          class="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Clonar"
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
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </button>
                        <button
                          v-if="!role.isSystem"
                          @click="confirmDelete(role)"
                          class="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Deletar"
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
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal: Criar/Editar Papel -->
    <AppModal
      v-model="showRoleModal"
      :title="isEditing ? `Editar: ${editingRole?.label}` : 'Novo Papel'"
      size="2xl"
    >
      <form class="space-y-6" @submit.prevent="saveRole">
        <!-- Informações Básicas -->
        <div class="space-y-4">
          <FormField
            label="Nome do Papel"
            hint="Use apenas letras e underscore (ex: CUSTOM_ADMIN)"
            required
          >
            <AppInput
              v-model="roleForm.name"
              placeholder="EX: CUSTOM_ANALYST"
              required
              :disabled="isEditing"
            />
          </FormField>

          <FormField
            label="Rótulo/Título"
            hint="Como exibir para usuários"
            required
          >
            <AppInput
              v-model="roleForm.label"
              placeholder="Ex: Analista Customizado"
              required
            />
          </FormField>

          <FormField label="Descrição" hint="Explique o propósito deste papel">
            <textarea
              v-model="roleForm.description"
              class="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              placeholder="Descrição do papel..."
              rows="2"
            />
          </FormField>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200 pt-6">
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Permissões</h3>
          <p class="text-xs text-gray-500 mb-4">
            Selecione quais ações o papel pode realizar em cada recurso
          </p>

          <!-- Grid de Permissões -->
          <PermissionToggleGrid
            :permissions="roleForm.permissions"
            @update:permissions="roleForm.permissions = $event"
          />
        </div>

        <!-- Botões -->
        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <AppButton
            type="button"
            variant="secondary"
            @click="showRoleModal = false"
          >
            Cancelar
          </AppButton>
          <AppButton type="submit" variant="primary">
            {{ isEditing ? "Salvar Alterações" : "Criar Papel" }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Modal: Clonar Papel -->
    <AppModal v-model="showCloneModal" title="Clonar Papel" size="sm">
      <div v-if="roleToClone" class="space-y-4">
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-900">
            Clonando papel <strong>{{ roleToClone.label }}</strong> com todas as
            suas permissões
          </p>
        </div>

        <FormField label="Nome do novo papel" required>
          <AppInput
            v-model="cloneName"
            placeholder="EX: CUSTOM_ANALYST_COPY"
            required
          />
        </FormField>

        <div class="flex justify-end gap-3">
          <AppButton
            type="button"
            variant="secondary"
            @click="showCloneModal = false"
          >
            Cancelar
          </AppButton>
          <AppButton type="button" variant="primary" @click="executeClone">
            Clonar
          </AppButton>
        </div>
      </div>
    </AppModal>

    <!-- Modal: Confirmar Exclusão -->
    <AppModal v-model="showDeleteModal" size="sm">
      <template #title>
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center"
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
          <span>Deletar Papel</span>
        </div>
      </template>

      <p class="text-sm text-gray-600 mb-4">
        Tem certeza que deseja deletar o papel
        <strong>{{ roleToDelete?.label }}</strong
        >?
      </p>

      <AppAlert
        variant="warning"
        message="⚠️ Usuários com este papel precisarão ser reatribuídos"
      />

      <div class="flex justify-end gap-3 pt-4">
        <AppButton
          type="button"
          variant="secondary"
          @click="showDeleteModal = false"
        >
          Cancelar
        </AppButton>
        <AppButton type="button" variant="danger" @click="executeDelete">
          Deletar Papel
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppAlert from "@/components/ui/AppAlert.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppModal from "@/components/ui/AppModal.vue";
import FormField from "@/components/ui/FormField.vue";
import {
  cloneRole as apiCloneRole,
  createRole,
  deleteRole,
  getAllRoles,
  updateRole,
  type CustomRole,
  type RolePermission,
} from "@/services/api/roles";
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref } from "vue";
import PermissionToggleGrid from "./components/PermissionToggleGrid.vue";

const authStore = useAuthStore();

const roles = ref<CustomRole[]>([]);
const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const searchTerm = ref("");
const showSystemOnly = ref(false);

const showRoleModal = ref(false);
const showCloneModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);

const editingRole = ref<CustomRole | null>(null);
const roleToClone = ref<CustomRole | null>(null);
const roleToDelete = ref<CustomRole | null>(null);
const cloneName = ref("");

const roleForm = ref<{
  name: string;
  label: string;
  description: string;
  permissions: RolePermission[];
}>({
  name: "",
  label: "",
  description: "",
  permissions: [],
});

const filteredRoles = computed(() =>
  roles.value
    .filter((r) => !showSystemOnly.value || r.isSystem)
    .filter(
      (r) =>
        r.label.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        r.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.value.toLowerCase()),
    ),
);

onMounted(async () => {
  loading.value = true;
  try {
    roles.value = await getAllRoles();
  } catch (error: any) {
    errorMessage.value = "Erro ao carregar papéis";
  } finally {
    loading.value = false;
  }
});

const resetForm = () => {
  roleForm.value = {
    name: "",
    label: "",
    description: "",
    permissions: [],
  };
  isEditing.value = false;
  editingRole.value = null;
};

const openCreateModal = () => {
  resetForm();
  showRoleModal.value = true;
};

const openEditModal = (role: CustomRole) => {
  editingRole.value = role;
  isEditing.value = true;
  roleForm.value = {
    name: role.name,
    label: role.label,
    description: role.description,
    permissions: [...role.permissions],
  };
  showRoleModal.value = true;
};

const saveRole = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (!roleForm.value.name || !roleForm.value.label) {
      errorMessage.value = "Nome e rótulo são obrigatórios";
      return;
    }

    if (isEditing.value && editingRole.value) {
      const updated = await updateRole(editingRole.value.id, {
        label: roleForm.value.label,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions,
      });

      const idx = roles.value.findIndex((r) => r.id === updated.id);
      if (idx !== -1) roles.value[idx] = updated;

      successMessage.value = `Papel "${roleForm.value.label}" atualizado!`;
    } else {
      const created = await createRole({
        name: roleForm.value.name,
        label: roleForm.value.label,
        description: roleForm.value.description,
        permissions: roleForm.value.permissions,
      });

      roles.value.push(created);
      successMessage.value = `Papel "${roleForm.value.label}" criado com sucesso!`;
    }

    showRoleModal.value = false;
    resetForm();
  } catch (error: any) {
    errorMessage.value = error.message ?? "Erro ao salvar papel";
  }
};

const confirmDelete = (role: CustomRole) => {
  roleToDelete.value = role;
  showDeleteModal.value = true;
};

const executeDelete = async () => {
  if (!roleToDelete.value) return;

  errorMessage.value = "";
  successMessage.value = "";

  try {
    await deleteRole(roleToDelete.value.id);
    roles.value = roles.value.filter((r) => r.id !== roleToDelete.value!.id);
    successMessage.value = `Papel "${roleToDelete.value.label}" deletado!`;
    showDeleteModal.value = false;
    roleToDelete.value = null;
  } catch (error: any) {
    errorMessage.value = error.message ?? "Erro ao deletar papel";
    showDeleteModal.value = false;
  }
};

const cloneRole = (role: CustomRole) => {
  roleToClone.value = role;
  cloneName.value = `${role.name}_COPY`;
  showCloneModal.value = true;
};

const executeClone = async () => {
  if (!roleToClone.value) return;

  errorMessage.value = "";
  successMessage.value = "";

  try {
    if (!cloneName.value) {
      errorMessage.value = "Nome do novo papel é obrigatório";
      return;
    }

    const cloned = await apiCloneRole(roleToClone.value.id, cloneName.value);
    roles.value.push(cloned);
    successMessage.value = `Papel "${cloned.label}" clonado com sucesso!`;
    showCloneModal.value = false;
    roleToClone.value = null;
    cloneName.value = "";
  } catch (error: any) {
    errorMessage.value = error.message ?? "Erro ao clonar papel";
  }
};
</script>
