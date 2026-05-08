<template>
  <button
    type="button"
    class="relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
    :class="[
      modelValue ? 'bg-green-500' : 'bg-gray-200',
      size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
    :disabled="disabled"
    @click="!disabled && $emit('update:modelValue', !modelValue)"
  >
    <span
      class="inline-block transform rounded-full bg-white shadow transition-transform duration-200"
      :class="[
        size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
        modelValue
          ? size === 'sm'
            ? 'translate-x-4'
            : 'translate-x-6'
          : 'translate-x-1',
      ]"
    />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    size?: "sm" | "md";
    disabled?: boolean;
  }>(),
  { size: "md", disabled: false },
);

defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>
