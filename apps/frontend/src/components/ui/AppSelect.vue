<template>
  <div class="relative">
    <select
      :id="id"
      v-bind="$attrs"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      class="w-full px-4 py-3 pr-10 rounded-xl border bg-white text-gray-900 appearance-none transition-all duration-200 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      :class="[
        error
          ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
          : 'border-gray-200 hover:border-gray-300',
        disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
      ]"
      @change="
        $emit('update:modelValue', ($event.target as HTMLSelectElement).value)
      "
    >
      <option v-if="placeholder" value="" disabled :selected="!modelValue">
        {{ placeholder }}
      </option>
      <slot />
    </select>
    <!-- Chevron icon -->
    <div
      class="pointer-events-none absolute inset-y-0 right-3 flex items-center"
    >
      <svg
        class="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });

defineProps<{
  id?: string;
  modelValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>
