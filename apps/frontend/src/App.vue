<template>
  <div id="app" class="app-shell">
    <main class="app-content">
      <router-view />
    </main>

    <footer
      class="app-footer border-t border-gray-200 bg-white/90 backdrop-blur px-4 text-center text-xs text-gray-600 dark:border-slate-800 dark:bg-slate-950/90 dark:text-slate-300"
    >
      Desenvolvido por <strong>Arthur Lunkes</strong>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";

const { initTheme } = useTheme();
initTheme();
</script>

<style>
.app-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.app-footer {
  flex-shrink: 0;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
