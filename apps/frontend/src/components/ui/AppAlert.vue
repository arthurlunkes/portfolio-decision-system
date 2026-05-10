<template>
  <div
    :class="[
      'flex items-start gap-3 px-4 py-3 rounded-xl border text-sm',
      variantClasses,
    ]"
  >
    <component :is="icon" class="w-5 h-5 shrink-0 mt-0.5" />
    <span
      ><slot>{{ message }}</slot></span
    >
  </div>
</template>

<script setup lang="ts">
import { computed, h } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "info" | "warning" | "error" | "success";
    message?: string;
  }>(),
  { variant: "info" },
);

const variantClasses = computed(
  () =>
    ({
      info: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-200",
      warning:
        "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200",
      error:
        "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200",
      success:
        "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-900 dark:text-green-200",
    })[props.variant],
);

const iconPaths: Record<string, string> = {
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  error: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z",
  success: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
};

const icon = computed(() =>
  h(
    "svg",
    {
      fill: "none",
      stroke: "currentColor",
      viewBox: "0 0 24 24",
      class: "w-5 h-5 shrink-0 mt-0.5",
    },
    [
      h("path", {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "stroke-width": "2",
        d: iconPaths[props.variant],
      }),
    ],
  ),
);
</script>
