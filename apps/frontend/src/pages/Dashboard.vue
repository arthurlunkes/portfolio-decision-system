<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <!-- Saudação -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bem-vindo de volta 👋</h1>
        <p class="text-gray-500 mt-1 text-sm">
          Aqui está um resumo do seu portfólio hoje.
        </p>
      </div>

      <div
        v-if="pageError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ pageError }}
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
            :key="result.projectId"
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import ActionCard from "@/components/ui/ActionCard.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import StatCard from "@/components/ui/StatCard.vue";
import { getCriteria } from "@/services/api/criteria";
import { getEvaluations } from "@/services/api/evaluations";
import { getProjects } from "@/services/api/projects";
import { getVikorRanking } from "@/services/api/results";
import { useAuthStore } from "@/stores/auth";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();

const stats = ref({
  projects: 0,
  criteria: 0,
  pendingEvaluations: 0,
  lastRankingDate: "Sem ranking",
});

const loading = ref(false);
const pageError = ref("");

const recentResults = ref<
  Array<{
    projectId: string;
    rank: number;
    name: string;
    score: string;
    badge: string;
    badgeClass: string;
  }>
>([]);

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function buildBadge(score: number, isAcceptable: boolean): {
  badge: string;
  badgeClass: string;
} {
  if (!isAcceptable) {
    return {
      badge: "Não aceitável",
      badgeClass: "bg-red-100 text-red-700",
    };
  }

  if (score >= 0.8) {
    return {
      badge: "Excelente",
      badgeClass: "bg-green-100 text-green-700",
    };
  }

  if (score >= 0.6) {
    return {
      badge: "Bom",
      badgeClass: "bg-blue-100 text-blue-700",
    };
  }

  return {
    badge: "Regular",
    badgeClass: "bg-amber-100 text-amber-700",
  };
}

async function loadDashboard() {
  loading.value = true;
  pageError.value = "";

  try {
    const [projects, criteria, evaluations, ranking] = await Promise.all([
      getProjects(),
      getCriteria(),
      getEvaluations(),
      getVikorRanking(),
    ]);

    const totalPossibleEvaluations = projects.length * criteria.length;
    const pendingEvaluations = Math.max(
      0,
      totalPossibleEvaluations - evaluations.length,
    );

    stats.value = {
      projects: projects.length,
      criteria: criteria.length,
      pendingEvaluations,
      lastRankingDate: ranking.length > 0 ? "Hoje" : "Sem ranking",
    };

    recentResults.value = ranking
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 5)
      .map((result) => {
        const score = clamp01(1 - result.qValue);
        const badge = buildBadge(score, result.isAcceptable);

        return {
          projectId: result.project.id,
          rank: result.rank,
          name: result.project.name,
          score: score.toFixed(2),
          badge: badge.badge,
          badgeClass: badge.badgeClass,
        };
      });
  } catch {
    pageError.value =
      "Não foi possível carregar os dados da dashboard agora. Tente novamente em instantes.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadDashboard();
});
</script>
