<template>
  <div
    class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 dark:bg-slate-900 dark:border-slate-800"
  >
    <div :class="['p-3 rounded-xl shrink-0', colorClasses.bg]">
      <svg
        class="w-6 h-6"
        :class="colorClasses.icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          :d="iconPath"
        />
      </svg>
    </div>
    <div class="min-w-0">
      <p class="text-sm font-medium text-gray-500 truncate dark:text-slate-400">
        {{ label }}
      </p>
      <p
        class="text-2xl font-bold text-gray-900 leading-tight dark:text-slate-100"
      >
        {{ value }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    color?: "blue" | "green" | "yellow" | "purple" | "red";
    iconPath: string;
  }>(),
  { color: "blue" },
);

const colorClasses = computed(
  () =>
    ({
      blue: { bg: "bg-blue-50 dark:bg-blue-950/40", icon: "text-blue-600" },
      green: { bg: "bg-green-50 dark:bg-green-950/40", icon: "text-green-600" },
      yellow: {
        bg: "bg-amber-50 dark:bg-amber-950/40",
        icon: "text-amber-600",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-950/40",
        icon: "text-purple-600",
      },
      red: { bg: "bg-red-50 dark:bg-red-950/40", icon: "text-red-600" },
    })[props.color],
);
</script>
