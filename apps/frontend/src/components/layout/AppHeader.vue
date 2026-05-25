<template>
  <header
    class="bg-white border-b border-gray-100 sticky top-0 z-30 dark:bg-slate-900 dark:border-slate-800"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo / Brand -->
        <div class="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="DecisionPortfólio"
            class="w-8 h-8 rounded-lg object-cover"
          />
          <span
            class="font-bold text-gray-900 text-lg tracking-tight dark:text-slate-100"
            >DecisionPortfólio</span
          >
        </div>

        <!-- Navigation -->
        <nav v-if="showNav" class="hidden md:flex items-center gap-1">
          <RouterLink
            v-for="item in navItemsToUse"
            :key="item.to"
            :to="item.to"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              $route.path === item.to
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800',
            ]"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
            @click="toggleTheme"
          >
            <svg
              v-if="isDark"
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646a9.003 9.003 0 1011.708 11.708z"
              />
            </svg>
          </button>

          <slot name="actions" />

          <!-- User avatar / profile link -->
          <RouterLink
            v-if="showLogout && authUser"
            to="/profile"
            class="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gray-100 transition-colors duration-150"
            :title="authUser.name"
          >
            <AppAvatar :name="authUser.name" size="sm" />
            <span
              class="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate"
            >
              {{ authUser.name }}
            </span>
          </RouterLink>

          <button
            v-if="showLogout"
            type="button"
            class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 dark:text-slate-300 dark:hover:text-slate-100 dark:hover:bg-slate-800"
            title="Sair"
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
import AppAvatar from "@/components/ui/AppAvatar.vue";
import { useTheme } from "@/composables/useTheme";
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const $route = useRoute();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();
const authUser = computed(
  () => authStore.user as { name: string; email: string } | null,
);

const isAdmin = computed(() => authStore.role === "ADMIN");

const defaultNavItems = computed(() => {
  const items = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/projects", label: "Projetos" },
    { to: "/criteria", label: "Critérios" },
    { to: "/evaluations", label: "Avaliações" },
    { to: "/results", label: "Resultados" },
    { to: "/users", label: "Decisores" },
    { to: "/roles", label: "Atribuições" },
  ];

  if (isAdmin.value) {
    items.push({ to: "/roles", label: "⚙️ Papéis" });
  }

  return items;
});

const props = withDefaults(
  defineProps<{
    showNav?: boolean;
    showLogout?: boolean;
    navItems?: { to: string; label: string }[];
  }>(),
  {
    showNav: true,
    showLogout: true,
    navItems: () => [],
  },
);

const navItemsToUse = computed(() => {
  return props.navItems && props.navItems.length > 0
    ? props.navItems
    : defaultNavItems.value;
});

defineEmits<{ logout: [] }>();
</script>
