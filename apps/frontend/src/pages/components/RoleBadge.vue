<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClass"
  >
    {{ badge.icon }} {{ badge.label }}
  </span>
</template>

<script setup lang="ts">
import type { UserRole } from "@/services/api/users";
import { computed } from "vue";

interface Props {
  role: UserRole;
}

const props = defineProps<Props>();

const badges: Record<
  UserRole,
  { label: string; icon: string; bgClass: string; textClass: string }
> = {
  ADMIN: {
    label: "Administrador",
    icon: "🔐",
    bgClass: "bg-purple-100",
    textClass: "text-purple-800",
  },
  DECISOR: {
    label: "Decisor",
    icon: "📊",
    bgClass: "bg-blue-100",
    textClass: "text-blue-800",
  },
  ANALYST: {
    label: "Analista",
    icon: "🔍",
    bgClass: "bg-green-100",
    textClass: "text-green-800",
  },
  VIEWER: {
    label: "Visualizador",
    icon: "👁️",
    bgClass: "bg-gray-100",
    textClass: "text-gray-800",
  },
};

const badge = computed(() => badges[props.role]);

const badgeClass = computed(
  () => `${badge.value.bgClass} ${badge.value.textClass}`,
);
</script>
