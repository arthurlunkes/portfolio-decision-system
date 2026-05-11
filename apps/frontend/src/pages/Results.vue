<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader @logout="authStore.logout()" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Page title + action -->
      <div class="flex items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Resultados VIKOR</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Ranking multicritério baseado no método VIKOR fuzzy
          </p>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-3">
          <AppButton variant="secondary" @click="exportResults('pdf')">
            Exportar PDF
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
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </AppButton>
          <AppButton variant="secondary" @click="exportResults('excel')">
            Exportar Excel
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
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </AppButton>
          <AppButton variant="primary" @click="calculateRanking">
            Calcular Ranking
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </AppButton>
        </div>
      </div>

      <div
        v-if="pageError"
        class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {{ pageError }}
      </div>

      <!-- Ranking Table -->
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div class="px-6 py-4 border-b border-gray-100">
          <h2
            class="text-sm font-semibold text-gray-400 uppercase tracking-wider"
          >
            Ranking VIKOR
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/60">
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Posição
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Projeto
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Valor S
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Valor R
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Valor Q
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Aceitabilidade
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(result, index) in rankingResults"
                :key="result.projectId"
                class="hover:bg-gray-50/60 transition-colors"
                :class="index === 0 ? 'bg-amber-50/40' : ''"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                      :class="
                        index === 0
                          ? 'bg-amber-100 text-amber-700'
                          : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-gray-50 text-gray-500'
                      "
                    >
                      #{{ index + 1 }}
                    </div>
                    <span
                      v-if="index === 0"
                      class="px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded-full"
                      >Melhor</span
                    >
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-semibold text-gray-900 text-sm">{{
                    result.projectName
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 font-mono">{{
                    result.sValue.toFixed(3)
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-600 font-mono">{{
                    result.rValue.toFixed(3)
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm font-semibold text-gray-900 font-mono">{{
                    result.qValue.toFixed(3)
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="
                      result.isAcceptable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ result.isAcceptable ? "Aceitável" : "Não Aceitável" }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3
            class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Comparação de Valores Q
          </h3>
          <div class="h-64">
            <canvas ref="barChart" />
          </div>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3
            class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1"
          >
            Desempenho Comparativo
          </h3>
          <p class="text-xs text-gray-500 mb-4">
            Eixos = projetos · Linhas = métricas VIKOR normalizadas (0–1, quanto
            maior melhor)
          </p>
          <div class="h-80">
            <canvas ref="radarChart" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppButton from "@/components/ui/AppButton.vue";
import { useTheme } from "@/composables/useTheme";
import { getVikorRanking } from "@/services/api/results";
import { useAuthStore } from "@/stores/auth";
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { nextTick, onMounted, ref, watch } from "vue";

const authStore = useAuthStore();
const { isDark } = useTheme();

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Title,
  Tooltip,
);

interface RankingResult {
  projectId: string;
  projectName: string;
  sValue: number;
  rValue: number;
  qValue: number;
  rank: number;
  isAcceptable: boolean;
}

const barChart = ref<HTMLCanvasElement>();
const radarChart = ref<HTMLCanvasElement>();
const rankingResults = ref<RankingResult[]>([]);
const calculating = ref(false);
const pageError = ref("");

let barChartInstance: Chart | null = null;
let radarChartInstance: Chart | null = null;

const calculateRanking = async () => {
  calculating.value = true;
  pageError.value = "";
  try {
    const results = await getVikorRanking();
    rankingResults.value = results
      .slice()
      .sort((a, b) => a.rank - b.rank)
      .map((r) => ({
        projectId: r.project.id,
        projectName: r.project.name,
        sValue: r.sValue,
        rValue: r.rValue,
        qValue: r.qValue,
        rank: r.rank,
        isAcceptable: r.isAcceptable,
      }));
    await nextTick();
    createBarChart();
    createRadarChart();
  } catch {
    pageError.value =
      "Erro ao calcular ranking. Verifique se todos os projetos foram avaliados.";
  } finally {
    calculating.value = false;
  }
};

const PALETTE_BG = [
  "rgba(34,197,94,0.8)",
  "rgba(59,130,246,0.8)",
  "rgba(239,68,68,0.8)",
  "rgba(234,179,8,0.8)",
  "rgba(168,85,247,0.8)",
  "rgba(20,184,166,0.8)",
];
const PALETTE_BORDER = PALETTE_BG.map((c) => c.replace("0.8", "1"));

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function normalizeLowerIsBetter(
  value: number,
  min: number,
  max: number,
): number {
  if (
    !Number.isFinite(value) ||
    !Number.isFinite(min) ||
    !Number.isFinite(max)
  ) {
    return 0;
  }
  if (max === min) {
    return 1;
  }
  return clamp01((max - value) / (max - min));
}

function createBarChart() {
  if (!barChart.value) return;
  if (barChartInstance) {
    barChartInstance.destroy();
    barChartInstance = null;
  }
  const ctx = barChart.value.getContext("2d");
  if (!ctx) return;
  const n = rankingResults.value.length;
  const textColor = isDark.value ? "#cbd5e1" : "#475569";
  const gridColor = isDark.value
    ? "rgba(100,116,139,0.25)"
    : "rgba(148,163,184,0.25)";
  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rankingResults.value.map((r) => r.projectName),
      datasets: [
        {
          label: "Valor Q",
          data: rankingResults.value.map((r) => r.qValue),
          backgroundColor: PALETTE_BG.slice(0, n),
          borderColor: PALETTE_BORDER.slice(0, n),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Valores Q dos Projetos",
          color: textColor,
        },
        legend: { display: false, labels: { color: textColor } },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
          ticks: { color: textColor },
          grid: { color: gridColor },
        },
        x: {
          ticks: { color: textColor },
          grid: { color: "transparent" },
        },
      },
    },
  });
}

function createRadarChart() {
  if (!radarChart.value) return;
  if (radarChartInstance) {
    radarChartInstance.destroy();
    radarChartInstance = null;
  }
  const ctx = radarChart.value.getContext("2d");
  if (!ctx) return;
  const textColor = isDark.value ? "#cbd5e1" : "#475569";

  const sValues = rankingResults.value.map((r) => r.sValue);
  const rValues = rankingResults.value.map((r) => r.rValue);
  const qValues = rankingResults.value.map((r) => r.qValue);

  const sMin = Math.min(...sValues);
  const sMax = Math.max(...sValues);
  const rMin = Math.min(...rValues);
  const rMax = Math.max(...rValues);
  const qMin = Math.min(...qValues);
  const qMax = Math.max(...qValues);

  // Spokes = projects, datasets = VIKOR metrics → no overlap between metrics
  const projectLabels = rankingResults.value.map((r) => r.projectName);

  const sData = rankingResults.value.map(
    (r) => +normalizeLowerIsBetter(r.sValue, sMin, sMax).toFixed(3),
  );
  const rData = rankingResults.value.map(
    (r) => +normalizeLowerIsBetter(r.rValue, rMin, rMax).toFixed(3),
  );
  const qData = rankingResults.value.map(
    (r) => +normalizeLowerIsBetter(r.qValue, qMin, qMax).toFixed(3),
  );
  const scoreData = rankingResults.value.map(
    (r) => +clamp01(1 - r.qValue).toFixed(3),
  );

  radarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: projectLabels,
      datasets: [
        {
          label: "S (menor melhor)",
          data: sData,
          backgroundColor: "rgba(34,197,94,0.15)",
          borderColor: "rgba(34,197,94,1)",
          pointBackgroundColor: "rgba(34,197,94,1)",
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: "R (menor melhor)",
          data: rData,
          backgroundColor: "rgba(59,130,246,0.15)",
          borderColor: "rgba(59,130,246,1)",
          pointBackgroundColor: "rgba(59,130,246,1)",
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: "Q (menor melhor)",
          data: qData,
          backgroundColor: "rgba(245,158,11,0.15)",
          borderColor: "rgba(245,158,11,1)",
          pointBackgroundColor: "rgba(245,158,11,1)",
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: "Score final",
          data: scoreData,
          backgroundColor: "rgba(99,102,241,0.15)",
          borderColor: "rgba(99,102,241,1)",
          pointBackgroundColor: "rgba(99,102,241,1)",
          pointRadius: 4,
          borderWidth: 2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Desempenho por Projeto (normalizado)",
          color: textColor,
        },
        legend: { position: "top", labels: { color: textColor } },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${Number(context.raw).toFixed(3)}`,
          },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          min: 0,
          max: 1,
          ticks: {
            stepSize: 0.2,
            backdropColor: "transparent",
            color: textColor,
            font: { size: 11 },
          },
          grid: { color: "rgba(148,163,184,0.25)" },
          pointLabels: { color: textColor, font: { size: 12 } },
        },
      },
    },
  });
}

const exportResults = (format: "pdf" | "excel") => {
  alert(`Exportando resultados em formato ${format.toUpperCase()}...`);
};

onMounted(() => {
  calculateRanking();
});

watch(isDark, () => {
  createBarChart();
  createRadarChart();
});
</script>
