<template>
  <header class="bg-white border-b border-gray-100 sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo / Brand -->
        <div class="flex items-center gap-3">
          <div
            class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm shadow-primary-200"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <span class="font-bold text-gray-900 text-lg tracking-tight"
            >DecisionPortfólio</span
          >
        </div>

        <!-- Navigation -->
        <nav v-if="showNav" class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              $route.path === item.to
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
            ]"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <slot name="actions" />
          <button
            v-if="showLogout"
            type="button"
            class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
            @click="$emit('logout')"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span class="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink, useRoute } from "vue-router";

const $route = useRoute();

withDefaults(
  defineProps<{
    showNav?: boolean;
    showLogout?: boolean;
    navItems?: { to: string; label: string }[];
  }>(),
  {
    showNav: true,
    showLogout: true,
    navItems: () => [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/projects", label: "Projetos" },
      { to: "/criteria", label: "Critérios" },
      { to: "/evaluations", label: "Avaliações" },
      { to: "/results", label: "Resultados" },
    ],
  },
);

defineEmits<{ logout: [] }>();
</script>
