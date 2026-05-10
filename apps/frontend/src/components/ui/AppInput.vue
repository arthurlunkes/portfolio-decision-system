<template>
  <input
    :id="id"
    v-bind="$attrs"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    :class="[
      'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400',
      'transition-all duration-200 outline-none',
      'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      error
        ? 'border-red-400 focus:ring-red-400 focus:border-red-400 dark:border-red-500'
        : 'border-gray-200 hover:border-gray-300 dark:border-slate-700 dark:hover:border-slate-600',
      disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800',
    ]"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
  id?: string;
  modelValue?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>
