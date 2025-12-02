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
            <h1 class="text-2xl font-bold text-gray-900">Critérios</h1>
          </div>
          <button
            @click="showAddModal = true"
            class="btn-primary"
          >
            Adicionar Critério
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Weight Validation Alert -->
      <div v-if="!isWeightValid" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-yellow-800">Soma dos pesos não é 100%</h3>
            <p class="text-sm text-yellow-700 mt-1">
              A soma total dos pesos deve ser igual a 100%. Atual: {{ totalWeight }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Criteria Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Peso
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="criterion in criteria" :key="criterion.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ criterion.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ criterion.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        class="bg-primary-600 h-2 rounded-full" 
                        :style="{ width: criterion.weight + '%' }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ criterion.weight }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="criterion.type === 'BENEFIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ criterion.type === 'BENEFIT' ? 'Benefício' : 'Custo' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editCriterion(criterion)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteCriterion(criterion)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ showEditModal ? 'Editar Critério' : 'Adicionar Critério' }}
        </h3>
        <form @submit.prevent="saveCriterion">
          <div class="mb-4">
            <label for="criterionName" class="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              id="criterionName"
              v-model="criterionForm.name"
              type="text"
              required
              class="input-field"
            />
          </div>
          <div class="mb-4">
            <label for="criterionDescription" class="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="criterionDescription"
              v-model="criterionForm.description"
              rows="3"
              required
              class="input-field"
            ></textarea>
          </div>
          <div class="mb-4">
            <label for="criterionWeight" class="block text-sm font-medium text-gray-700 mb-2">
              Peso (%)
            </label>
            <input
              id="criterionWeight"
              v-model.number="criterionForm.weight"
              type="number"
              min="1"
              max="100"
              required
              class="input-field"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div class="space-y-2">
              <label class="inline-flex items-center">
                <input
                  v-model="criterionForm.type"
                  type="radio"
                  value="BENEFIT"
                  class="form-radio"
                />
                <span class="ml-2">Benefício (quanto maior, melhor)</span>
              </label>
              <label class="inline-flex items-center">
                <input
                  v-model="criterionForm.type"
                  type="radio"
                  value="COST"
                  class="form-radio"
                />
                <span class="ml-2">Custo (quanto menor, melhor)</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              {{ showEditModal ? 'Atualizar' : 'Adicionar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Criterion {
  id: string
  name: string
  description: string
  weight: number
  type: 'BENEFIT' | 'COST'
}

const showAddModal = ref(false)
const showEditModal = ref(false)

const criterionForm = ref({
  id: '',
  name: '',
  description: '',
  weight: 10,
  type: 'BENEFIT' as 'BENEFIT' | 'COST'
})

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

const totalWeight = computed(() => {
  return criteria.value.reduce((sum, criterion) => sum + criterion.weight, 0)
})

const isWeightValid = computed(() => {
  return totalWeight.value === 100
})

const editCriterion = (criterion: Criterion) => {
  criterionForm.value = { ...criterion }
  showEditModal.value = true
}

const deleteCriterion = (criterion: Criterion) => {
  if (confirm(`Tem certeza que deseja excluir o critério "${criterion.name}"?`)) {
    criteria.value = criteria.value.filter(c => c.id !== criterion.id)
  }
}

const saveCriterion = () => {
  if (showEditModal.value) {
    const index = criteria.value.findIndex(c => c.id === criterionForm.value.id)
    if (index !== -1) {
      criteria.value[index] = { ...criterionForm.value }
    }
  } else {
    const newCriterion: Criterion = {
      id: Date.now().toString(),
      name: criterionForm.value.name,
      description: criterionForm.value.description,
      weight: criterionForm.value.weight,
      type: criterionForm.value.type
    }
    criteria.value.push(newCriterion)
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  criterionForm.value = {
    id: '',
    name: '',
    description: '',
    weight: 10,
    type: 'BENEFIT'
  }
}
</script>