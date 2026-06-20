<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <!-- Cabeçalho -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Pesos dos Decisores (λk)</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Defina o grau de expertise de cada decisor por portfólio. O sistema usa esses pesos na
            agregação 2-tuple antes de rodar o VIKOR.
          </p>
        </div>

        <!-- Selecionar portfólio -->
        <div class="w-72">
          <label class="block text-xs font-semibold text-gray-500 mb-1">Portfólio</label>
          <AppSelect v-model="selectedPortfolioId" placeholder="Selecione um portfólio">
            <option v-for="p in portfolios" :key="p.id" :value="p.id">{{ p.name }}</option>
          </AppSelect>
        </div>

        <AppAlert v-if="pageError" variant="error" :message="pageError" />

        <template v-if="selectedPortfolioId">
          <!-- Info box -->
          <div class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 space-y-1">
            <p>
              <strong>Escala de expertise:</strong>
              EN(0) · IN(1) · PI(2) · OI(3) ·
              <strong>IM(4) = padrão</strong> · MI(5) · EM(6)
            </p>
            <p>
              Quando todos os decisores têm o mesmo grau (ex: todos IM=4), λk = 1/n →
              resultado idêntico à média aritmética simples.
            </p>
          </div>

          <!-- Adicionar / editar vínculo -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Atribuir Peso
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">Decisor</label>
                <AppSelect v-model="form.evaluatorId" placeholder="Selecione o decisor">
                  <option v-for="u in availableUsers" :key="u.id" :value="u.id">
                    {{ u.name }} ({{ u.email }})
                  </option>
                </AppSelect>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1">
                  Grau de expertise
                </label>
                <AppSelect v-model="form.weightLinguistic">
                  <option v-for="t in EXPERTISE_TERMS" :key="t.value" :value="t.value">
                    {{ t.label }}
                  </option>
                </AppSelect>
              </div>
              <div class="flex items-end gap-3">
                <div class="text-xs text-gray-500 leading-tight">
                  <p class="font-semibold text-gray-700">Peso normalizado (prévia)</p>
                  <p>{{ previewNormalized }}</p>
                </div>
                <AppButton
                  variant="primary"
                  :disabled="!form.evaluatorId || saving"
                  @click="save"
                >
                  {{ saving ? 'Salvando...' : 'Salvar' }}
                </AppButton>
              </div>
            </div>
          </div>

          <!-- Tabela de pesos atuais -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Pesos Atuais — {{ links.length }} decisor(es)
              </h2>
              <p v-if="links.length > 0" class="text-xs text-gray-400">
                Σλk = {{ lambdaSum }}
              </p>
            </div>

            <div v-if="loading" class="p-8 text-center text-sm text-gray-400">
              Carregando...
            </div>
            <div v-else-if="links.length === 0" class="p-8 text-center text-sm text-gray-400">
              Nenhum vínculo cadastrado. O sistema usará pesos iguais (λk = 1/n).
            </div>
            <table v-else class="w-full text-sm">
              <thead class="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Decisor</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expertise</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Valor (βk)</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">λk normalizado</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Barra</th>
                  <th class="px-6 py-3" />
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="link in links"
                  :key="link.id"
                  class="hover:bg-gray-50/50 transition-colors"
                >
                  <td class="px-6 py-3">
                    <p class="font-semibold text-gray-900">{{ link.evaluator.name }}</p>
                    <p class="text-xs text-gray-400">{{ link.evaluator.email }}</p>
                  </td>
                  <td class="px-6 py-3">
                    <span class="px-2.5 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                      {{ link.weightLinguistic }}
                    </span>
                  </td>
                  <td class="px-6 py-3 font-mono text-gray-700">{{ link.weightNumeric }}</td>
                  <td class="px-6 py-3 font-mono font-semibold text-gray-900">
                    {{ (link.weightNormalized * 100).toFixed(1) }}%
                  </td>
                  <td class="px-6 py-3">
                    <div class="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-2 bg-primary-500 rounded-full transition-all"
                        :style="{ width: (link.weightNormalized * 100) + '%' }"
                      />
                    </div>
                  </td>
                  <td class="px-6 py-3 text-right">
                    <button
                      type="button"
                      class="text-xs font-medium text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      :disabled="deleting === link.id"
                      @click="remove(link)"
                    >
                      {{ deleting === link.id ? 'Removendo...' : 'Remover' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Exemplo numérico -->
          <div
            v-if="links.length >= 2"
            class="rounded-xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600"
          >
            <p class="font-semibold text-gray-800 mb-2">Verificação: β̄ = Σ(λk · βk)</p>
            <div class="font-mono text-xs space-y-1">
              <p v-for="link in links" :key="link.id">
                λ<sub>{{ link.evaluator.name.split(' ')[0] }}</sub>
                = {{ link.weightNumeric }} / {{ totalBeta }} = {{ (link.weightNormalized * 100).toFixed(1) }}%
              </p>
              <p class="pt-1 border-t border-gray-100 text-gray-400">
                Soma = {{ lambdaSum }}
                <span v-if="lambdaSum === '100.0%'" class="text-green-600 ml-1">✓</span>
              </p>
            </div>
          </div>
        </template>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppAlert from '@/components/ui/AppAlert.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import { usePortfolioContext } from '@/composables/usePortfolioContext'
import { useAuthStore } from '@/stores/auth'
import {
  EXPERTISE_TERMS,
  getDecissorPortfolios,
  upsertDecissorPortfolio,
  deleteDecissorPortfolio,
  type DecissorPortfolio,
} from '@/services/api/decissor-portfolio'
import { getUsers, type User } from '@/services/api/users'
import { computed, onMounted, ref, watch } from 'vue'

const authStore = useAuthStore()
const { portfolios, selectedPortfolioId } = usePortfolioContext()

const links = ref<DecissorPortfolio[]>([])
const users = ref<User[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref<string | null>(null)
const pageError = ref('')

const form = ref({ evaluatorId: '', weightLinguistic: 'IM' })

const availableUsers = computed(() =>
  users.value.filter((u) => u.role === 'DECISOR' || u.role === 'ANALYST'),
)

const totalBeta = computed(() => links.value.reduce((s, l) => s + l.weightNumeric, 0))

const lambdaSum = computed(() => {
  const sum = links.value.reduce((s, l) => s + l.weightNormalized, 0)
  return (sum * 100).toFixed(1) + '%'
})

// Preview what λk will be if user adds/changes the current form selection
const previewNormalized = computed(() => {
  const existingLink = links.value.find((l) => l.evaluatorId === form.value.evaluatorId)
  const termEntry = EXPERTISE_TERMS.find((t) => t.value === form.value.weightLinguistic)
  const newNumeric = termEntry?.numeric ?? 4

  const otherTotal = links.value
    .filter((l) => l.evaluatorId !== form.value.evaluatorId)
    .reduce((s, l) => s + l.weightNumeric, 0)
  const total = otherTotal + newNumeric
  if (total === 0) return 'N/A'
  return ((newNumeric / total) * 100).toFixed(1) + '%'
})

async function loadLinks() {
  if (!selectedPortfolioId.value) return
  loading.value = true
  pageError.value = ''
  try {
    links.value = await getDecissorPortfolios(selectedPortfolioId.value)
  } catch {
    pageError.value = 'Erro ao carregar vínculos.'
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
  watch(selectedPortfolioId, loadLinks, { immediate: true })
})

async function save() {
  if (!selectedPortfolioId.value || !form.value.evaluatorId) return
  saving.value = true
  pageError.value = ''
  try {
    await upsertDecissorPortfolio(
      selectedPortfolioId.value,
      form.value.evaluatorId,
      form.value.weightLinguistic,
    )
    await loadLinks()
    form.value.evaluatorId = ''
    form.value.weightLinguistic = 'IM'
  } catch (e: any) {
    pageError.value = e?.message ?? 'Erro ao salvar.'
  } finally {
    saving.value = false
  }
}

async function remove(link: DecissorPortfolio) {
  deleting.value = link.id
  pageError.value = ''
  try {
    await deleteDecissorPortfolio(link.portfolioId, link.evaluatorId)
    await loadLinks()
  } catch {
    pageError.value = 'Erro ao remover vínculo.'
  } finally {
    deleting.value = null
  }
}
</script>
