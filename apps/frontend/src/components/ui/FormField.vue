<template>
  <div class="space-y-1.5">
    <label
      v-if="label"
      :for="fieldId"
      class="block text-xs font-semibold text-gray-500 uppercase tracking-wider"
    >
      {{ label }}
      <span v-if="required" class="text-red-400 ml-0.5">*</span>
    </label>
    <slot />
    <p v-if="errorMessage" class="text-xs text-red-600">{{ errorMessage }}</p>
    <p v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string;
  fieldId?: string;
  hint?: string;
  errorMessage?: string;
  required?: boolean;
}>();
</script>
