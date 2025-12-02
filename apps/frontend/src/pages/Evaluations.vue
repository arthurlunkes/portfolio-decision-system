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
            <h1 class="text-2xl font-bold text-gray-900">Avaliações</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Project Selection -->
      <div class="card mb-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Selecionar Projeto</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="project in projects"
            :key="project.id"
            @click="selectProject(project)"
            class="border rounded-lg p-4 cursor-pointer transition-all"
            :class="selectedProject?.id === project.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <h4 class="font-medium text-gray-900">{{ project.name }}</h4>
            <p class="text-sm text-gray-500 mt-1">{{ project.description }}</p>
            <div class="mt-3">
              <span class="text-xs text-gray-400">
                {{ getEvaluationStatus(project.id) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Criteria Evaluation -->
      <div v-if="selectedProject" class="card">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">
            Avaliar: {{ selectedProject.name }}
          </h3>
          <div class="text-sm text-gray-500">
            {{ completedEvaluations }} de {{ criteria.length }} critérios avaliados
          </div>
        </div>

        <div class="space-y-6">
          <div
            v-for="criterion in criteria"
            :key="criterion.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h4 class="font-medium text-gray-900">{{ criterion.name }}</h4>
                <p class="text-sm text-gray-500">{{ criterion.description }}</p>
                <div class="mt-1">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="criterion.type === 'BENEFIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ criterion.type === 'BENEFIT' ? 'Benefício' : 'Custo' }}
                  </span>
                  <span class="ml-2 text-xs text-gray-500">Peso: {{ criterion.weight }}%</span>
                </div>
              </div>
              <div v-if="getEvaluation(selectedProject.id, criterion.id)" class="text-right">
                <div class="text-sm text-gray-500">Avaliado como</div>
                <div class="font-medium text-gray-900">
                  {{ getEvaluation(selectedProject.id, criterion.id)?.linguisticTerm }}
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="term in linguisticTerms"
                :key="term.value"
                @click="evaluateCriterion(criterion.id, term.value)"
                class="p-3 text-sm border rounded-lg transition-all"
                :class="getEvaluation(selectedProject.id, criterion.id)?.linguisticTerm === term.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'"
              >
                {{ term.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-between">
          <button
            @click="selectedProject = null"
            class="btn-secondary"
          >
            Voltar
          </button>
          <button
            @click="saveEvaluations"
            :disabled="completedEvaluations !== criteria.length"
            class="btn-primary"
          >
            Salvar Avaliações
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Project {
  id: string
  name: string
  description: string
}

interface Criterion {
  id: string
  name: string
  description: string
  weight: number
  type: 'BENEFIT' | 'COST'
}

interface Evaluation {
  projectId: string
  criterionId: string
  linguisticTerm: string
  fuzzyValue?: number
  label?: string
  alpha?: number
}

const selectedProject = ref<Project | null>(null)

const projects = ref<Project[]>([
  {
    id: '1',
    name: 'Sistema de Gestão ERP',
    description: 'Desenvolvimento de sistema ERP integrado para gestão empresarial'
  },
  {
    id: '2',
    name: 'Aplicativo Mobile',
    description: 'Aplicativo mobile para gestão de tarefas e produtividade'
  },
  {
    id: '3',
    name: 'Portal Web E-commerce',
    description: 'Desenvolvimento de plataforma de e-commerce B2B'
  }
])

const criteria = ref<Criterion[]>([
  {
    id: '1',
    name: 'Custo de Desenvolvimento',
    description: 'Custo total de desenvolvimento do projeto',
    weight: 25,
    type: 'COST'
  },
  {
    id: '2',
    name: 'Tempo de Entrega',
    description: 'Prazo estimado para entrega do projeto',
    weight: 20,
    type: 'COST'
  },
  {
    id: '3',
    name: 'Qualidade Técnica',
    description: 'Qualidade técnica e arquitetura da solução',
    weight: 30,
    type: 'BENEFIT'
  },
  {
    id: '4',
    name: 'Retorno sobre Investimento',
    description: 'ROI esperado do projeto',
    weight: 25,
    type: 'BENEFIT'
  }
])

const linguisticTerms = [
  { value: 'very-low', label: 'Muito Baixo' },
  { value: 'low', label: 'Baixo' },
  { value: 'medium-low', label: 'Médio-Baixo' },
  { value: 'medium', label: 'Médio' },
  { value: 'medium-high', label: 'Médio-Alto' },
  { value: 'high', label: 'Alto' },
  { value: 'very-high', label: 'Muito Alto' }
]

const evaluations = ref<Evaluation[]>([])

const completedEvaluations = computed(() => {
  if (!selectedProject.value) return 0
  return evaluations.value.filter(e => e.projectId === selectedProject.value!.id).length
})

const selectProject = (project: Project) => {
  selectedProject.value = project
}

const getEvaluation = (projectId: string, criterionId: string) => {
  return evaluations.value.find(e => 
    e.projectId === projectId && e.criterionId === criterionId
  )
}

const getEvaluationStatus = (projectId: string) => {
  const projectEvaluations = evaluations.value.filter(e => e.projectId === projectId)
  const totalCriteria = criteria.value.length
  return `${projectEvaluations.length} de ${totalCriteria} critérios avaliados`
}

const evaluateCriterion = (criterionId: string, linguisticTerm: string) => {
  if (!selectedProject.value) return

  const existingEvaluation = evaluations.value.find(e => 
    e.projectId === selectedProject.value!.id && e.criterionId === criterionId
  )

  if (existingEvaluation) {
    existingEvaluation.linguisticTerm = linguisticTerm
  } else {
    evaluations.value.push({
      projectId: selectedProject.value.id,
      criterionId,
      linguisticTerm
    })
  }
}

const saveEvaluations = () => {
  alert('Avaliações salvas com sucesso!')
  selectedProject.value = null
}
</script>