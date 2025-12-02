<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center space-x-4">
            <button
              @click="$router.push('/dashboard')"
              class="text-gray-500 hover:text-gray-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-gray-900">Resultados VIKOR</h1>
          </div>
          <button
            @click="calculateRanking"
            class="btn-primary"
          >
            Calcular Ranking
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Ranking Table -->
      <div class="card mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Ranking VIKOR</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Posição
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projeto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor S
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor R
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Q
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aceitabilidade
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(result, index) in rankingResults" :key="result.projectId">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="text-lg font-bold text-gray-900">#{{ index + 1 }}</div>
                    <div v-if="index === 0" class="ml-2 px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                      Melhor
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ result.projectName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ result.sValue.toFixed(3) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ result.rValue.toFixed(3) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ result.qValue.toFixed(3) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="result.isAcceptable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ result.isAcceptable ? 'Aceitável' : 'Não Aceitável' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Bar Chart -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Comparação de Valores Q</h3>
          <div class="h-64">
            <canvas ref="barChart"></canvas>
          </div>
        </div>

        <!-- Radar Chart -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Desempenho por Critério</h3>
          <div class="h-64">
            <canvas ref="radarChart"></canvas>
          </div>
        </div>
      </div>

      <!-- Export Options -->
      <div class="card mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Exportar Resultados</h3>
        <div class="flex space-x-4">
          <button
            @click="exportResults('pdf')"
            class="btn-secondary"
          >
            Exportar PDF
          </button>
          <button
            @click="exportResults('excel')"
            class="btn-secondary"
          >
            Exportar Excel
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  Filler
} from 'chart.js'

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
  Filler
)

interface RankingResult {
  projectId: string
  projectName: string
  sValue: number
  rValue: number
  qValue: number
  rank: number
  isAcceptable: boolean
}

const barChart = ref<HTMLCanvasElement>()
const radarChart = ref<HTMLCanvasElement>()

const rankingResults = ref<RankingResult[]>([
  {
    projectId: '1',
    projectName: 'Sistema de Gestão ERP',
    sValue: 0.234,
    rValue: 0.156,
    qValue: 0.189,
    rank: 1,
    isAcceptable: true
  },
  {
    projectId: '2',
    projectName: 'Aplicativo Mobile',
    sValue: 0.445,
    rValue: 0.289,
    qValue: 0.367,
    rank: 2,
    isAcceptable: true
  },
  {
    projectId: '3',
    projectName: 'Portal Web E-commerce',
    sValue: 0.567,
    rValue: 0.334,
    qValue: 0.445,
    rank: 3,
    isAcceptable: false
  }
])

const calculateRanking = () => {
  alert('Calculando ranking VIKOR...')
  // This would trigger the backend calculation
}

const createBarChart = () => {
  if (!barChart.value) return

  const ctx = barChart.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: rankingResults.value.map(r => r.projectName),
      datasets: [{
        label: 'Valor Q',
        data: rankingResults.value.map(r => r.qValue),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Valores Q dos Projetos'
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 1
        }
      }
    }
  })
}

const createRadarChart = () => {
  if (!radarChart.value) return

  const ctx = radarChart.value.getContext('2d')
  if (!ctx) return

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Custo', 'Tempo', 'Qualidade', 'ROI'],
      datasets: rankingResults.value.map((result, index) => ({
        label: result.projectName,
        data: [
          Math.random() * 0.5 + 0.3, // Simulated values
          Math.random() * 0.5 + 0.3,
          Math.random() * 0.5 + 0.5,
          Math.random() * 0.5 + 0.4
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.2)',
          'rgba(59, 130, 246, 0.2)',
          'rgba(239, 68, 68, 0.2)'
        ][index],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ][index],
        borderWidth: 2
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Desempenho por Critério'
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 1
        }
      }
    }
  })
}

const exportResults = (format: 'pdf' | 'excel') => {
  alert(`Exportando resultados em formato ${format.toUpperCase()}...`)
}

onMounted(() => {
  createBarChart()
  createRadarChart()
})
</script>