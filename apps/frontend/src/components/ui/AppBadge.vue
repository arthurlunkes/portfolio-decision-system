<template>
  <span
    class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full"
    :class="variantClasses"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "purple" | "primary" | "gray" | "green" | "red" | "amber";
  }>(),
  { variant: "gray" },
);

const variantClasses = computed(
  () =>
    ({
      purple: "bg-purple-100 text-purple-700",
      primary: "bg-primary-100 text-primary-700",
      gray: "bg-gray-100 text-gray-600",
      green: "bg-green-100 text-green-700",
      red: "bg-red-100 text-red-700",
      amber: "bg-amber-100 text-amber-700",
    })[props.variant],
);
</script>
