<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";

const { initTheme } = useTheme();
initTheme();
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
