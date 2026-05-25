<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Cabeçalho -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Gerenciador de Permissões
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Controle de acesso baseado em papéis e recursos
          </p>
        </div>

        <AppAlert v-if="errorMessage" variant="error" :message="errorMessage" />

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total de Usuários"
            :value="stats?.totalUsers ?? '-'"
            icon="👥"
          />
          <StatCard
            title="Administradores"
            :value="stats?.usersByRole?.ADMIN ?? '-'"
            icon="🔐"
          />
          <StatCard
            title="Decisores"
            :value="stats?.usersByRole?.DECISOR ?? '-'"
            icon="📊"
          />
          <StatCard
            title="Analistas"
            :value="stats?.usersByRole?.ANALYST ?? '-'"
            icon="🔍"
          />
        </div>

        <!-- Abas -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex border-b border-gray-100">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="flex-1 px-6 py-4 text-sm font-semibold transition-colors"
              :class="
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              "
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="p-6">
            <!-- Aba: Matriz de Permissões -->
            <div v-if="activeTab === 'matrix'" class="space-y-6">
              <div>
                <h2 class="text-lg font-semibold text-gray-900 mb-4">
                  Matriz de Permissões: Recursos × Papéis
                </h2>

                <div v-if="loading" class="text-center py-12">
                  <div class="inline-block animate-spin">⏳</div>
                  <p class="text-gray-500 mt-2">Carregando matriz...</p>
                </div>

                <div v-else class="overflow-x-auto">
                  <table class="min-w-full">
                    <thead>
                      <tr class="border-b border-gray-200 bg-gray-50">
                        <th
                          class="px-4 py-3 text-left text-xs font-semibold text-gray-600"
                        >
                          Recurso
                        </th>
                        <th
                          v-for="role in allRoles"
                          :key="role"
                          class="px-4 py-3 text-center text-xs font-semibold text-gray-600"
                        >
                          {{ roleLabel(role) }}
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr
                        v-for="resource in allResources"
                        :key="resource"
                        class="hover:bg-gray-50"
                      >
                        <td class="px-4 py-3 text-sm font-medium text-gray-900">
                          {{ resourceLabel(resource) }}
                        </td>
                        <td
                          v-for="role in allRoles"
                          :key="role"
                          class="px-4 py-3 text-center"
                        >
                          <PermissionCell :resource="resource" :role="role" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Legenda -->
              <div
                class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
              >
                <h3 class="text-sm font-semibold text-blue-900 mb-2">Ações</h3>
                <div
                  class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-blue-800"
                >
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 bg-green-500 rounded"
                    ></span>
                    <span>Criar</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 bg-blue-500 rounded"
                    ></span>
                    <span>Ler</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 bg-yellow-500 rounded"
                    ></span>
                    <span>Atualizar</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 bg-red-500 rounded"
                    ></span>
                    <span>Deletar</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="inline-block w-3 h-3 bg-purple-500 rounded"
                    ></span>
                    <span>Exportar</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Aba: Permissões por Papel -->
            <div v-if="activeTab === 'roles'" class="space-y-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div
                  v-for="role in allRoles"
                  :key="role"
                  class="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                >
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-semibold text-gray-900">
                      {{ roleLabel(role) }}
                    </h3>
                    <RoleBadge :role="role" />
                  </div>

                  <p class="text-xs text-gray-500 mb-4">
                    {{ roleDescription(role) }}
                  </p>

                  <div v-if="rolePermissions[role]" class="space-y-2">
                    <div
                      v-for="(perm, idx) in rolePermissions[role]"
                      :key="idx"
                      class="flex items-center gap-2 text-xs"
                    >
                      <span
                        class="inline-block w-2 h-2 bg-primary-500 rounded-full"
                      ></span>
                      <span class="text-gray-600">
                        {{ actionLabel(perm.action) }} em
                        {{ resourceLabel(perm.resource) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Aba: Auditoria -->
            <div v-if="activeTab === 'audit'" class="space-y-4">
              <div class="text-center py-12">
                <p class="text-gray-500">Log de auditoria em breve...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppAlert from "@/components/ui/AppAlert.vue";
import StatCard from "@/components/ui/StatCard.vue";
import {
  Action,
  getAllRolePermissions,
  getPermissionStats,
  Resource,
  type PermissionStats,
} from "@/services/api/permissions";
import type { UserRole } from "@/services/api/users";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref } from "vue";
import PermissionCell from "./components/PermissionCell.vue";
import RoleBadge from "./components/RoleBadge.vue";

const authStore = useAuthStore();

// Tabs
const tabs = [
  { id: "matrix", label: "📊 Matriz de Permissões" },
  { id: "roles", label: "👤 Permissões por Papel" },
  { id: "audit", label: "📋 Auditoria" },
];

const activeTab = ref<"matrix" | "roles" | "audit">("matrix");
const loading = ref(false);
const errorMessage = ref("");

const allRoles: UserRole[] = ["ADMIN", "DECISOR", "ANALYST", "VIEWER"];
const allResources = [
  Resource.PROJECTS,
  Resource.CRITERIA,
  Resource.EVALUATIONS,
  Resource.RESULTS,
  Resource.USERS,
  Resource.PERMISSIONS,
];

const rolePermissions = ref<Record<UserRole, any[]>>({
  ADMIN: [],
  DECISOR: [],
  ANALYST: [],
  VIEWER: [],
});

const stats = ref<PermissionStats | null>(null);

// Carrega dados
onMounted(async () => {
  loading.value = true;
  errorMessage.value = "";

  try {
    const rolesData = await getAllRolePermissions();
    rolesData.forEach((rp) => {
      rolePermissions.value[rp.role] = rp.permissions;
    });

    stats.value = await getPermissionStats();
  } catch (error: any) {
    errorMessage.value = error.message ?? "Erro ao carregar permissões";
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

const roleDescription = (role: UserRole): string => {
  const descriptions: Record<UserRole, string> = {
    ADMIN: "Acesso total a todos os recursos",
    DECISOR: "Criar e gerenciar projetos e avaliações",
    ANALYST: "Visualizar e criar avaliações",
    VIEWER: "Acesso de leitura apenas",
  };
  return descriptions[role];
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
</script>
