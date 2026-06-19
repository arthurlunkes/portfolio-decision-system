<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Gerenciar Avaliações</h1>
          <p class="text-sm text-gray-500 mt-0.5">Visualize e exclua avaliações por decisor</p>
        </div>

        <AppAlert v-if="pageError" variant="error" :message="pageError" />

        <!-- Filtros -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-col sm:flex-row gap-3">
          <div class="flex-1">
            <label class="block text-xs font-semibold text-gray-500 mb-1">Decisor</label>
            <AppSelect v-model="selectedEvaluatorId" placeholder="Todos os decisores">
              <option value="">Todos</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
            </AppSelect>
          </div>
          <div class="flex-1">
            <label class="block text-xs font-semibold text-gray-500 mb-1">Projeto</label>
            <AppSelect v-model="selectedProjectId" placeholder="Todos os projetos">
              <option value="">Todos</option>
              <option v-for="p in uniqueProjects" :key="p.id" :value="p.id">{{ p.name }}</option>
            </AppSelect>
          </div>
        </div>

        <!-- Tabela -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div v-if="loading" class="p-8 text-center text-gray-400 text-sm">Carregando...</div>
          <div v-else-if="filteredEvaluations.length === 0" class="p-8 text-center text-gray-400 text-sm">
            Nenhuma avaliação encontrada.
          </div>
          <table v-else class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Decisor</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Projeto</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Critério</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Termo</th>
                <th class="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fuzzy</th>
                <th class="px-6 py-3" />
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="ev in filteredEvaluations" :key="ev.id" class="hover:bg-gray-50/50">
                <td class="px-6 py-3 font-medium text-gray-900">{{ evaluatorName(ev.evaluatorId) }}</td>
                <td class="px-6 py-3 text-gray-700">{{ ev.project.name }}</td>
                <td class="px-6 py-3 text-gray-700">{{ ev.criterion.name }}</td>
                <td class="px-6 py-3">
                  <span class="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                    {{ ev.linguisticTerm }}
                  </span>
                </td>
                <td class="px-6 py-3 text-gray-500">{{ ev.fuzzyValue.toFixed(2) }}</td>
                <td class="px-6 py-3 text-right">
                  <button
                    type="button"
                    class="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    :disabled="deleting === ev.id"
                    @click="handleDelete(ev.id)"
                  >
                    {{ deleting === ev.id ? 'Excluindo...' : 'Excluir' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredEvaluations.length > 0" class="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
            {{ filteredEvaluations.length }} avaliação(ões)
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppAlert from '@/components/ui/AppAlert.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { getEvaluations, deleteEvaluation, type Evaluation } from '@/services/api/evaluations'
import { getUsers, type User } from '@/services/api/users'
import { ref, computed, onMounted, watch } from 'vue'

const authStore = useAuthStore()

const users = ref<User[]>([])
const evaluations = ref<Evaluation[]>([])
const selectedEvaluatorId = ref('')
const selectedProjectId = ref('')
const loading = ref(false)
const deleting = ref<string | null>(null)
const pageError = ref('')

async function loadEvaluations() {
  loading.value = true
  pageError.value = ''
  try {
    evaluations.value = await getEvaluations(
      selectedEvaluatorId.value ? { evaluatorId: selectedEvaluatorId.value } : undefined,
    )
  } catch {
    pageError.value = 'Erro ao carregar avaliações.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    users.value = await getUsers()
  } catch {
    pageError.value = 'Erro ao carregar usuários.'
  }
  await loadEvaluations()
})

watch(selectedEvaluatorId, () => {
  selectedProjectId.value = ''
  loadEvaluations()
})

const uniqueProjects = computed(() => {
  const map = new Map<string, { id: string; name: string }>()
  for (const ev of evaluations.value) map.set(ev.project.id, ev.project)
  return [...map.values()]
})

const filteredEvaluations = computed(() => {
  if (!selectedProjectId.value) return evaluations.value
  return evaluations.value.filter((ev) => ev.project.id === selectedProjectId.value)
})

function evaluatorName(evaluatorId: string) {
  const u = users.value.find((u) => u.id === evaluatorId)
  return u ? u.name : evaluatorId
}

async function handleDelete(id: string) {
  deleting.value = id
  pageError.value = ''
  try {
    await deleteEvaluation(id)
    evaluations.value = evaluations.value.filter((ev) => ev.id !== id)
  } catch {
    pageError.value = 'Erro ao excluir avaliação.'
  } finally {
    deleting.value = null
  }
}
</script>
