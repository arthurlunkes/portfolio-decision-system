<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
        @click.self="close"
      >
        <div
          :class="[
            'w-full bg-white rounded-2xl shadow-xl max-h-[calc(100vh-2rem)] flex flex-col overscroll-contain',
            sizeClass,
          ]"
          @wheel.stop
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0"
          >
            <slot name="title">
              <h3 class="text-lg font-bold text-gray-900">{{ title }}</h3>
            </slot>
            <button
              type="button"
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              @click="close"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4 overflow-y-auto min-h-0">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
  }>(),
  { size: "md" },
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

const close = () => emit("update:modelValue", false);

const sizeClass = computed(
  () =>
    ({
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
    })[props.size],
);

const toggleBodyScroll = (isOpen: boolean) => {
  document.body.style.overflow = isOpen ? "hidden" : "";
};

watch(
  () => props.modelValue,
  (isOpen) => {
    toggleBodyScroll(isOpen);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  toggleBodyScroll(false);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
