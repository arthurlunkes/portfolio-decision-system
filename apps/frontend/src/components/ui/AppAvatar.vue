<template>
  <div
    :class="[
      'rounded-xl flex items-center justify-center font-semibold flex-shrink-0',
      sizeClass,
      colorClass,
    ]"
    :title="name"
  >
    {{ initials }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

const props = withDefaults(
  defineProps<{
    name: string;
    size?: "xs" | "sm" | "md" | "lg";
  }>(),
  { size: "md" },
);

const initials = computed(() =>
  props.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase(),
);

const colorClass = computed(
  () => COLORS[props.name.charCodeAt(0) % COLORS.length],
);

const sizeClass = computed(
  () =>
    ({
      xs: "w-6 h-6 text-xs",
      sm: "w-8 h-8 text-xs",
      md: "w-9 h-9 text-sm",
      lg: "w-10 h-10 text-sm",
    })[props.size],
);
</script>
