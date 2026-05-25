<template>
  <div class="flex flex-wrap justify-center gap-1">
    <span
      v-for="icon in icons"
      :key="icon"
      :title="getActionTitle(icon)"
      class="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-semibold cursor-default"
      :class="getActionColor(icon)"
    >
      {{ icon }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Action, Resource } from "@/services/api/permissions";
import type { UserRole } from "@/services/api/users";
import { computed } from "vue";
import { ROLE_PERMISSIONS } from "./permissionMatrix";

interface Props {
  resource: Resource;
  role: UserRole;
}

const props = defineProps<Props>();

const hasPermission = (action: Action): boolean => {
  const rolePerms = ROLE_PERMISSIONS[props.role];
  return rolePerms.some(
    (p) => p.resource === props.resource && p.action === action,
  );
};

const icons = computed(() => {
  const result = [];
  if (hasPermission(Action.CREATE)) result.push("C");
  if (hasPermission(Action.READ)) result.push("R");
  if (hasPermission(Action.UPDATE)) result.push("U");
  if (hasPermission(Action.DELETE)) result.push("D");
  if (hasPermission(Action.EXPORT)) result.push("E");
  return result.length > 0 ? result : ["—"];
});

const getActionColor = (icon: string): string => {
  if (icon === "—") return "bg-gray-100 text-gray-400";
  const colors: Record<string, string> = {
    C: "bg-green-100 text-green-700",
    R: "bg-blue-100 text-blue-700",
    U: "bg-yellow-100 text-yellow-700",
    D: "bg-red-100 text-red-700",
    E: "bg-purple-100 text-purple-700",
  };
  return colors[icon] || "bg-gray-100 text-gray-400";
};

const getActionTitle = (icon: string): string => {
  const titles: Record<string, string> = {
    C: "Criar",
    R: "Ler/Visualizar",
    U: "Atualizar/Editar",
    D: "Deletar",
    E: "Exportar",
    "—": "Sem permissão",
  };
  return titles[icon] || "";
};
</script>
