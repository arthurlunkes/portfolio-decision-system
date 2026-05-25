<template>
  <div class="space-y-4">
    <!-- Toolbar -->
    <div class="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
      <button
        v-for="action in actions"
        :key="action"
        @click="toggleAllAction(action)"
        class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
        :class="
          isAllActionEnabled(action)
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        "
        :title="`Toggle ${actionLabel(action)} para todos os recursos`"
      >
        {{ actionLabel(action) }} (Tudo)
      </button>
    </div>

    <!-- Grid de Permissões -->
    <div class="overflow-x-auto border border-gray-200 rounded-lg">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th
              class="px-4 py-3 text-left text-xs font-semibold text-gray-600 w-32"
            >
              Recurso
            </th>
            <th
              v-for="action in actions"
              :key="action"
              class="px-4 py-3 text-center text-xs font-semibold text-gray-600 min-w-[80px]"
              :title="actionLabel(action)"
            >
              <div class="flex flex-col items-center">
                <span class="text-lg mb-1">{{ getActionIcon(action) }}</span>
                <span class="text-xs">{{
                  actionLabel(action).substring(0, 3)
                }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="resource in resources"
            :key="resource"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <!-- Nome do Recurso -->
            <td class="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50">
              {{ resourceLabel(resource) }}
            </td>

            <!-- Checkbox para cada Ação -->
            <td
              v-for="action in actions"
              :key="`${resource}-${action}`"
              class="px-4 py-3 text-center"
            >
              <input
                type="checkbox"
                :checked="hasPermission(resource, action)"
                @change="togglePermission(resource, action)"
                class="w-5 h-5 rounded cursor-pointer accent-blue-600"
                :aria-label="`${resourceLabel(resource)}: ${actionLabel(action)}`"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Resumo -->
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p class="text-sm text-blue-900">
        <strong>{{ permissions.length }} permissões selecionadas</strong>
      </p>
      <div class="mt-2 flex flex-wrap gap-2">
        <span
          v-for="perm in permissions"
          :key="`${perm.resource}-${perm.action}`"
          class="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-xs rounded border border-blue-200"
        >
          <span>{{ resourceLabel(perm.resource) }}</span>
          <span class="text-blue-600">→</span>
          <span>{{ actionLabel(perm.action) }}</span>
          <button
            @click="removePermission(perm.resource, perm.action)"
            class="ml-1 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Action, Resource } from "@/services/api/permissions";
import {
  Action as ActionEnum,
  Resource as ResourceEnum,
} from "@/services/api/permissions";
import { computed } from "vue";

interface Props {
  permissions: Array<{ resource: Resource; action: Action }>;
  resources?: Resource[];
  actions?: Action[];
}

interface Emits {
  (
    e: "update:permissions",
    permissions: Array<{ resource: Resource; action: Action }>,
  ): void;
}

const props = withDefaults(defineProps<Props>(), {
  resources: () => [
    ResourceEnum.PROJECTS,
    ResourceEnum.CRITERIA,
    ResourceEnum.EVALUATIONS,
    ResourceEnum.RESULTS,
    ResourceEnum.USERS,
    ResourceEnum.PERMISSIONS,
  ],
  actions: () => [
    ActionEnum.CREATE,
    ActionEnum.READ,
    ActionEnum.UPDATE,
    ActionEnum.DELETE,
    ActionEnum.EXPORT,
  ],
});

const emit = defineEmits<Emits>();

const resourceLabels: Record<Resource, string> = {
  PROJECTS: "Projetos",
  CRITERIA: "Critérios",
  EVALUATIONS: "Avaliações",
  RESULTS: "Resultados",
  USERS: "Usuários",
  PERMISSIONS: "Permissões",
};

const actionLabels: Record<Action, string> = {
  CREATE: "Criar",
  READ: "Ler",
  UPDATE: "Atualizar",
  DELETE: "Deletar",
  EXPORT: "Exportar",
  VIEW_RESULTS: "Ver Resultados",
  MANAGE_USERS: "Gerenciar Usuários",
  MANAGE_PERMISSIONS: "Gerenciar Permissões",
};

const actionIcons: Record<Action, string> = {
  CREATE: "➕",
  READ: "👁️",
  UPDATE: "✏️",
  DELETE: "🗑️",
  EXPORT: "📤",
  VIEW_RESULTS: "📊",
  MANAGE_USERS: "👥",
  MANAGE_PERMISSIONS: "🔐",
};

const resources = computed(() => props.resources);
const actions = computed(() => props.actions);

const hasPermission = (resource: Resource, action: Action): boolean => {
  return props.permissions.some(
    (p) => p.resource === resource && p.action === action,
  );
};

const togglePermission = (resource: Resource, action: Action) => {
  const newPermissions = hasPermission(resource, action)
    ? props.permissions.filter(
        (p) => !(p.resource === resource && p.action === action),
      )
    : [...props.permissions, { resource, action }];
  emit("update:permissions", newPermissions);
};

const removePermission = (resource: Resource, action: Action) => {
  const newPermissions = props.permissions.filter(
    (p) => !(p.resource === resource && p.action === action),
  );
  emit("update:permissions", newPermissions);
};

const toggleAllAction = (action: Action) => {
  const allHaveAction = resources.value.every((r) => hasPermission(r, action));

  let newPermissions = [...props.permissions];

  if (allHaveAction) {
    // Remove action de todos os recursos
    newPermissions = newPermissions.filter((p) => p.action !== action);
  } else {
    // Add action a todos os recursos
    resources.value.forEach((resource) => {
      if (!hasPermission(resource, action)) {
        newPermissions.push({ resource, action });
      }
    });
  }

  emit("update:permissions", newPermissions);
};

const isAllActionEnabled = (action: Action): boolean => {
  return resources.value.every((r) => hasPermission(r, action));
};

const resourceLabel = (resource: Resource): string => {
  return resourceLabels[resource] || resource;
};

const actionLabel = (action: Action): string => {
  return actionLabels[action] || action;
};

const getActionIcon = (action: Action): string => {
  return actionIcons[action] || "❓";
};
</script>
