<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader @logout="authStore.logout()" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Page title + action -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Resultados VIKOR</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Ranking multicritério baseado no método VIKOR fuzzy
          </p>
        </div>
        <AppButton variant="primary" @click="calculateRanking">
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
          Calcular Ranking
        </AppButton>
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
            class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
          >
            Desempenho por Critério
          </h3>
          <div class="h-64">
            <canvas ref="radarChart" />
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3
          class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
        >
          Exportar Resultados
        </h3>
        <div class="flex flex-wrap gap-3">
          <AppButton variant="secondary" @click="exportResults('pdf')">
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
            Exportar PDF
          </AppButton>
          <AppButton variant="secondary" @click="exportResults('excel')">
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
            Exportar Excel
          </AppButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { useAuthStore } from "@/stores/auth";
import { ref, onMounted } from "vue";
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";

const authStore = useAuthStore();

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
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

const rankingResults = ref<RankingResult[]>([
  {
    projectId: "1",
    projectName: "Sistema de Gestão ERP",
    sValue: 0.234,
    rValue: 0.156,
    qValue: 0.189,
    rank: 1,
    isAcceptable: true,
  },
  {
    projectId: "2",
    projectName: "Aplicativo Mobile",
    sValue: 0.445,
    rValue: 0.289,
    qValue: 0.367,
    rank: 2,
    isAcceptable: true,
  },
  {
    projectId: "3",
    projectName: "Portal Web E-commerce",
    sValue: 0.567,
    rValue: 0.334,
    qValue: 0.445,
    rank: 3,
    isAcceptable: false,
  },
]);

const calculateRanking = () => {
  alert("Calculando ranking VIKOR...");
  // This would trigger the backend calculation
};

const createBarChart = () => {
  if (!barChart.value) return;

  const ctx = barChart.value.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: rankingResults.value.map((r) => r.projectName),
      datasets: [
        {
          label: "Valor Q",
          data: rankingResults.value.map((r) => r.qValue),
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(59, 130, 246, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgba(34, 197, 94, 1)",
            "rgba(59, 130, 246, 1)",
            "rgba(239, 68, 68, 1)",
          ],
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
        },
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });
};

const createRadarChart = () => {
  if (!radarChart.value) return;

  const ctx = radarChart.value.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Custo", "Tempo", "Qualidade", "ROI"],
      datasets: rankingResults.value.map((result, index) => ({
        label: result.projectName,
        data: [
          Math.random() * 0.5 + 0.3, // Simulated values
          Math.random() * 0.5 + 0.3,
          Math.random() * 0.5 + 0.5,
          Math.random() * 0.5 + 0.4,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.2)",
          "rgba(59, 130, 246, 0.2)",
          "rgba(239, 68, 68, 0.2)",
        ][index],
        borderColor: [
          "rgba(34, 197, 94, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(239, 68, 68, 1)",
        ][index],
        borderWidth: 2,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: "Desempenho por Critério",
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 1,
        },
      },
    },
  });
};

const exportResults = (format: "pdf" | "excel") => {
  alert(`Exportando resultados em formato ${format.toUpperCase()}...`);
};

onMounted(() => {
  createBarChart();
  createRadarChart();
});
</script>
