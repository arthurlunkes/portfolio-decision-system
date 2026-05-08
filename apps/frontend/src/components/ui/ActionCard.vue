<template>
  <button
    type="button"
    :class="[
      'group bg-white rounded-2xl border border-gray-100 shadow-sm p-5',
      'flex items-center gap-4 text-left w-full',
      'hover:shadow-md hover:border-gray-200 transition-all duration-200',
    ]"
    @click="$emit('click')"
  >
    <div
      :class="[
        'p-3 rounded-xl shrink-0 transition-colors duration-200',
        colorClasses.bg,
        colorClasses.groupHover,
      ]"
    >
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
      <p
        class="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200"
      >
        {{ title }}
      </p>
      <p class="text-sm text-gray-500 mt-0.5">{{ description }}</p>
    </div>
    <svg
      class="w-5 h-5 text-gray-300 group-hover:text-primary-400 ml-auto shrink-0 transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    iconPath: string;
    color?: "blue" | "green" | "purple" | "amber" | "red";
  }>(),
  { color: "blue" },
);

defineEmits<{ click: [] }>();

const colorClasses = computed(
  () =>
    ({
      blue: {
        bg: "bg-blue-50",
        icon: "text-blue-600",
        groupHover: "group-hover:bg-blue-100",
      },
      green: {
        bg: "bg-green-50",
        icon: "text-green-600",
        groupHover: "group-hover:bg-green-100",
      },
      purple: {
        bg: "bg-purple-50",
        icon: "text-purple-600",
        groupHover: "group-hover:bg-purple-100",
      },
      amber: {
        bg: "bg-amber-50",
        icon: "text-amber-600",
        groupHover: "group-hover:bg-amber-100",
      },
      red: {
        bg: "bg-red-50",
        icon: "text-red-600",
        groupHover: "group-hover:bg-red-100",
      },
    })[props.color],
);
</script>
