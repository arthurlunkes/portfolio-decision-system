<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader @logout="authStore.logout()" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Saudação -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bem-vindo de volta 👋</h1>
        <p class="text-gray-500 mt-1 text-sm">
          Aqui está um resumo do seu portfólio hoje.
        </p>
      </div>

      <!-- Cards de estatísticas -->
      <section>
        <h2
          class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
        >
          Visão Geral
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de Projetos"
            :value="stats.projects"
            color="blue"
            icon-path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
          <StatCard
            label="Critérios"
            :value="stats.criteria"
            color="green"
            icon-path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
          <StatCard
            label="Avaliações Pendentes"
            :value="stats.pendingEvaluations"
            color="yellow"
            icon-path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
          <StatCard
            label="Último Ranking"
            :value="stats.lastRankingDate"
            color="purple"
            icon-path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </div>
      </section>

      <!-- Ações rápidas -->
      <section>
        <h2
          class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
        >
          Ações Rápidas
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard
            title="Projetos"
            description="Gerenciar projetos do portfólio"
            color="blue"
            icon-path="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            @click="$router.push('/projects')"
          />
          <ActionCard
            title="Critérios"
            description="Definir critérios de avaliação"
            color="green"
            icon-path="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            @click="$router.push('/criteria')"
          />
          <ActionCard
            title="Avaliações"
            description="Realizar avaliações linguísticas"
            color="purple"
            icon-path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            @click="$router.push('/evaluations')"
          />
        </div>
      </section>

      <!-- Resultados recentes -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2
            class="text-sm font-semibold text-gray-400 uppercase tracking-wider"
          >
            Resultados Recentes
          </h2>
          <button
            class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            @click="$router.push('/results')"
          >
            Ver todos →
          </button>
        </div>

        <div
          class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div
            v-for="(result, i) in recentResults"
            :key="result.name"
            :class="[
              'flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors',
              i !== recentResults.length - 1 && 'border-b border-gray-50',
            ]"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
              >
                #{{ result.rank }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ result.name }}</p>
                <p class="text-sm text-gray-400">Score: {{ result.score }}</p>
              </div>
            </div>
            <span
              :class="[
                'px-2.5 py-1 text-xs font-semibold rounded-full',
                result.badgeClass,
              ]"
            >
              {{ result.badge }}
            </span>
          </div>

          <div
            v-if="!recentResults.length"
            class="px-6 py-10 text-center text-gray-400 text-sm"
          >
            Nenhum resultado disponível ainda.
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import ActionCard from "@/components/ui/ActionCard.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import StatCard from "@/components/ui/StatCard.vue";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();

const stats = ref({
  projects: 12,
  criteria: 8,
  pendingEvaluations: 3,
  lastRankingDate: "Hoje",
});

const recentResults = ref([
  {
    rank: 1,
    name: "Projeto Alpha",
    score: "0.85",
    badge: "Excelente",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    rank: 2,
    name: "Projeto Beta",
    score: "0.72",
    badge: "Bom",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    rank: 3,
    name: "Projeto Gamma",
    score: "0.61",
    badge: "Regular",
    badgeClass: "bg-amber-100 text-amber-700",
  },
]);

onMounted(() => {
  // carregar dados do dashboard
});
</script>
