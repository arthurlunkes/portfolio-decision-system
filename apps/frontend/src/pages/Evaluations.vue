<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Page title -->
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Avaliações</h1>
          <p class="text-sm text-gray-500 mt-0.5">Avalie a importância dos critérios e o desempenho dos projetos</p>
        </div>

        <!-- Portfolio selector -->
        <div class="w-64">
          <AppSelect v-model="selectedPortfolioId" placeholder="Selecione um portfólio">
            <option v-for="p in portfolios" :key="p.id" :value="p.id">{{ p.name }}</option>
          </AppSelect>
        </div>

        <div v-if="pageError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ pageError }}
        </div>
        <div v-if="saveSuccess" class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Avaliações salvas com sucesso!
        </div>

        <!-- Abas -->
        <div class="flex gap-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-1 w-fit">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="px-5 py-2.5 text-sm font-medium rounded-xl transition-all"
            :class="
              activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <span
              v-if="tab.key === 'importance' && importanceCompleted && criteria.length > 0"
              class="ml-1.5 inline-block w-2 h-2 rounded-full bg-green-400"
            />
            <span
              v-else-if="tab.key === 'importance' && !importanceCompleted && criteria.length > 0"
              class="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-400"
            />
          </button>
        </div>

        <!-- ======================== ABA: IMPORTÂNCIA DOS CRITÉRIOS ======================== -->
        <div v-if="activeTab === 'importance'" class="space-y-4">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div class="flex items-center justify-between mb-1">
              <h2 class="font-bold text-gray-900">Importância dos Critérios</h2>
              <span class="text-xs text-gray-400">
                {{ importancesFilledCount }} / {{ criteria.length }} avaliados
              </span>
            </div>
            <p class="text-sm text-gray-500 mb-5">
              Informe o grau de importância de cada critério. O motor usará esses valores para calcular ωj automaticamente.
            </p>

            <div v-if="!selectedPortfolioId" class="text-center py-8 text-sm text-gray-400">
              Selecione um portfólio para ver os critérios.
            </div>
            <div v-else-if="criteria.length === 0" class="text-center py-8 text-sm text-gray-400">
              Nenhum critério cadastrado para este portfólio.
            </div>
            <div v-else class="space-y-4">
              <div v-for="criterion in criteria" :key="criterion.id" class="border border-gray-100 rounded-xl p-4">
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <h4 class="font-semibold text-gray-900">{{ criterion.name }}</h4>
                      <span
                        class="px-2 py-0.5 text-xs font-semibold rounded-full"
                        :class="criterion.type === 'BENEFIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      >
                        {{ criterion.type === 'BENEFIT' ? 'Benefício' : 'Custo' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 mt-0.5">{{ criterion.description }}</p>
                  </div>
                  <span v-if="getImportance(criterion.id)" class="shrink-0 px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                    ✓ {{ getImportance(criterion.id)?.linguisticTerm }}
                  </span>
                </div>
                <div class="grid grid-cols-3 sm:grid-cols-7 gap-2">
                  <button
                    v-for="term in IMPORTANCE_TERMS"
                    :key="term.value"
                    type="button"
                    :disabled="importanceLocked"
                    class="py-2 px-1 text-xs font-medium rounded-xl border-2 transition-all text-center"
                    :class="[
                      getImportance(criterion.id)?.linguisticTerm === term.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-100 bg-gray-50 text-gray-600',
                      importanceLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-200 hover:text-gray-900',
                    ]"
                    @click="!importanceLocked && setImportance(criterion.id, term.value)"
                  >
                    <span class="font-bold block">{{ term.value }}</span>
                    <span class="text-gray-400 text-[10px]">{{ term.numeric }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <AppButton
              v-if="!importanceLocked"
              variant="primary"
              :disabled="importancesFilledCount !== criteria.length || savingImportance"
              @click="saveImportances"
            >
              {{ savingImportance ? 'Salvando...' : 'Salvar Importâncias' }}
            </AppButton>
            <span v-else class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl">
              🔒 Importâncias salvas
            </span>
          </div>
        </div>

        <!-- ======================== ABA: DESEMPENHO DOS PROJETOS ======================== -->
        <div v-if="activeTab === 'performance'" class="space-y-4">
          <!-- Project Selection -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Selecionar Projeto</h2>
            <div v-if="!selectedPortfolioId" class="text-sm text-gray-400 py-4 text-center">
              Selecione um portfólio acima.
            </div>
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                v-for="project in projects"
                :key="project.id"
                type="button"
                class="group text-left p-4 rounded-xl border-2 transition-all duration-150"
                :class="
                  selectedProject?.id === project.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                "
                @click="selectProject(project)"
              >
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-semibold text-gray-900 text-sm">{{ project.name }}</h4>
                  <span v-if="isProjectLocked(project.id)" class="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-semibold rounded-full">
                    🔒 Salvo
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ project.description }}</p>
                <p class="text-xs font-medium mt-2" :class="isProjectLocked(project.id) ? 'text-gray-400' : 'text-primary-600'">
                  {{ getEvaluationStatus(project.id) }}
                </p>
              </button>
            </div>
          </div>

          <!-- Criteria Evaluation -->
          <Transition name="slide-up">
            <div v-if="selectedProject" class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-bold text-gray-900">{{ isCurrentProjectLocked ? '🔒 ' : '' }}{{ selectedProject.name }}</h2>
                  <p class="text-sm text-gray-400 mt-0.5">
                    <span v-if="isCurrentProjectLocked">Avaliações salvas — não podem ser alteradas.</span>
                    <span v-else>{{ completedEvaluations }} de {{ criteria.length }} critérios avaliados</span>
                  </p>
                </div>
                <div v-if="!isCurrentProjectLocked" class="hidden sm:flex items-center gap-3 min-w-[180px]">
                  <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-1.5 bg-primary-500 rounded-full transition-all duration-300"
                      :style="{ width: criteria.length > 0 ? (completedEvaluations / criteria.length) * 100 + '%' : '0%' }"
                    />
                  </div>
                  <span class="text-xs font-semibold text-gray-500">
                    {{ criteria.length > 0 ? Math.round((completedEvaluations / criteria.length) * 100) : 0 }}%
                  </span>
                </div>
              </div>

              <div v-if="isCurrentProjectLocked" class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                Este projeto já foi avaliado. Para alterar, contate um administrador.
              </div>

              <div v-for="criterion in criteria" :key="criterion.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <h4 class="font-semibold text-gray-900">{{ criterion.name }}</h4>
                      <span
                        class="px-2 py-0.5 text-xs font-semibold rounded-full"
                        :class="criterion.type === 'BENEFIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                      >
                        {{ criterion.type === 'BENEFIT' ? 'Benefício' : 'Custo' }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-500 mt-0.5">{{ criterion.description }}</p>
                  </div>
                  <span v-if="getEvaluation(selectedProject.id, criterion.id)" class="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                    ✓ {{ getEvaluation(selectedProject.id, criterion.id)?.linguisticTerm }}
                  </span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  <button
                    v-for="term in linguisticTerms"
                    :key="term.value"
                    type="button"
                    :disabled="isCurrentProjectLocked"
                    class="py-2.5 px-2 text-xs font-medium rounded-xl border-2 transition-all duration-150 text-center"
                    :class="[
                      getEvaluation(selectedProject.id, criterion.id)?.linguisticTerm === term.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-100 bg-gray-50 text-gray-600',
                      isCurrentProjectLocked ? 'opacity-60 cursor-not-allowed' : 'hover:border-gray-200 hover:text-gray-900',
                    ]"
                    @click="!isCurrentProjectLocked && evaluateCriterion(criterion.id, term.value)"
                  >
                    {{ term.label }}
                  </button>
                </div>
              </div>

              <div class="flex justify-between pt-2">
                <AppButton variant="secondary" @click="selectedProject = null">Voltar</AppButton>
                <AppButton
                  v-if="!isCurrentProjectLocked"
                  variant="primary"
                  :disabled="completedEvaluations !== criteria.length || saving"
                  @click="saveEvaluations"
                >
                  {{ saving ? 'Salvando...' : 'Salvar Avaliações' }}
                </AppButton>
                <span v-else class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-xl">
                  🔒 Avaliações salvas
                </span>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import AppSelect from "@/components/ui/AppSelect.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { usePortfolioContext } from "@/composables/usePortfolioContext";
import { useAuthStore } from "@/stores/auth";
import { getProjects } from "@/services/api/projects";
import { getCriteria } from "@/services/api/criteria";
import { getEvaluations, createEvaluation } from "@/services/api/evaluations";
import { IMPORTANCE_TERMS, getCriterionImportances, upsertCriterionImportance } from "@/services/api/criterion-importance";
import type { Evaluation as ApiEvaluation } from "@/services/api/evaluations";
import type { CriterionImportance } from "@/services/api/criterion-importance";
import { ref, computed, onMounted, watch } from "vue";

const authStore = useAuthStore();
const { portfolios, selectedPortfolioId } = usePortfolioContext();

const activeTab = ref<'importance' | 'performance'>('importance');
const tabs = [
  { key: 'importance' as const, label: '1. Importância dos Critérios' },
  { key: 'performance' as const, label: '2. Desempenho dos Projetos' },
];

interface Project { id: string; name: string; description: string }
interface Criterion { id: string; name: string; description: string; weight: number; type: 'BENEFIT' | 'COST' }
interface LocalEval { projectId: string; criterionId: string; linguisticTerm: string }

const selectedProject = ref<Project | null>(null);
const projects = ref<Project[]>([]);
const criteria = ref<Criterion[]>([]);
const evaluations = ref<LocalEval[]>([]);
const importances = ref<CriterionImportance[]>([]);
const lockedProjects = ref<Set<string>>(new Set());
const importanceLocked = ref(false);
const localImportances = ref<Map<string, string>>(new Map()); // criterionId → term
const saving = ref(false);
const savingImportance = ref(false);
const saveSuccess = ref(false);
const pageError = ref("");

const linguisticTerms = [
  { value: "EB", label: "Extremamente Baixo (EB)" },
  { value: "MB", label: "Muito Baixo (MB)" },
  { value: "B",  label: "Baixo (B)" },
  { value: "M",  label: "Médio (M)" },
  { value: "A",  label: "Alto (A)" },
  { value: "MA", label: "Muito Alto (MA)" },
  { value: "EA", label: "Extremamente Alto (EA)" },
];

async function loadData() {
  if (!selectedPortfolioId.value) return;
  try {
    const [p, c, e, imp] = await Promise.all([
      getProjects(selectedPortfolioId.value),
      getCriteria(selectedPortfolioId.value),
      getEvaluations(),
      getCriterionImportances(selectedPortfolioId.value),
    ]);
    projects.value = p;
    criteria.value = c;
    selectedProject.value = null;
    saveSuccess.value = false;

    evaluations.value = e.map((ev: ApiEvaluation) => ({
      projectId: ev.project.id,
      criterionId: ev.criterion.id,
      linguisticTerm: ev.linguisticTerm,
    }));

    importances.value = imp;

    // Pré-carregar importâncias locais do DB
    const impMap = new Map<string, string>();
    for (const i of imp) impMap.set(i.criterion.id, i.linguisticTerm);
    localImportances.value = impMap;

    // Lock importâncias se todas já foram avaliadas
    importanceLocked.value = c.length > 0 && imp.length >= c.length;

    // Lock projetos com avaliações completas
    const locked = new Set<string>();
    for (const project of p) {
      const count = evaluations.value.filter((ev) => ev.projectId === project.id).length;
      if (c.length > 0 && count >= c.length) locked.add(project.id);
    }
    lockedProjects.value = locked;
  } catch {
    pageError.value = "Erro ao carregar dados.";
  }
}

onMounted(loadData);
watch(selectedPortfolioId, loadData);

// --- IMPORTÂNCIA ---
const importancesFilledCount = computed(() => localImportances.value.size);
const importanceCompleted = computed(() =>
  criteria.value.length > 0 && importancesFilledCount.value >= criteria.value.length,
);

const getImportance = (criterionId: string) => {
  const term = localImportances.value.get(criterionId);
  if (!term) return null;
  return { linguisticTerm: term };
};

const setImportance = (criterionId: string, term: string) => {
  localImportances.value = new Map(localImportances.value).set(criterionId, term);
};

const saveImportances = async () => {
  if (!selectedPortfolioId.value) return;
  savingImportance.value = true;
  pageError.value = "";
  try {
    for (const [criterionId, term] of localImportances.value) {
      await upsertCriterionImportance(criterionId, selectedPortfolioId.value, term);
    }
    importanceLocked.value = true;
    saveSuccess.value = true;
    // Reload importances from DB
    importances.value = await getCriterionImportances(selectedPortfolioId.value);
  } catch {
    pageError.value = "Erro ao salvar importâncias.";
  } finally {
    savingImportance.value = false;
  }
};

// --- DESEMPENHO ---
const isProjectLocked = (projectId: string) => lockedProjects.value.has(projectId);
const isCurrentProjectLocked = computed(() =>
  selectedProject.value ? isProjectLocked(selectedProject.value.id) : false,
);
const completedEvaluations = computed(() => {
  if (!selectedProject.value) return 0;
  return evaluations.value.filter((e) => e.projectId === selectedProject.value!.id).length;
});
const selectProject = (project: Project) => {
  selectedProject.value = project;
  saveSuccess.value = false;
};
const getEvaluation = (projectId: string, criterionId: string) =>
  evaluations.value.find((e) => e.projectId === projectId && e.criterionId === criterionId);
const getEvaluationStatus = (projectId: string) => {
  if (isProjectLocked(projectId)) return "✓ Avaliação completa e salva";
  const count = evaluations.value.filter((e) => e.projectId === projectId).length;
  return `${count} de ${criteria.value.length} critérios avaliados`;
};
const evaluateCriterion = (criterionId: string, term: string) => {
  if (!selectedProject.value || isCurrentProjectLocked.value) return;
  const existing = evaluations.value.find(
    (e) => e.projectId === selectedProject.value!.id && e.criterionId === criterionId,
  );
  if (existing) { existing.linguisticTerm = term; }
  else { evaluations.value.push({ projectId: selectedProject.value.id, criterionId, linguisticTerm: term }); }
};
const saveEvaluations = async () => {
  if (!selectedProject.value || isCurrentProjectLocked.value) return;
  saving.value = true;
  pageError.value = "";
  try {
    const projectEvals = evaluations.value.filter((e) => e.projectId === selectedProject.value!.id);
    await Promise.all(
      projectEvals.map((e) => createEvaluation({ projectId: e.projectId, criterionId: e.criterionId, linguisticTerm: e.linguisticTerm })),
    );
    const projectId = selectedProject.value.id;
    lockedProjects.value = new Set([...lockedProjects.value, projectId]);
    saveSuccess.value = true;
    selectedProject.value = null;
  } catch {
    pageError.value = "Erro ao salvar avaliações.";
  } finally {
    saving.value = false;
  }
};
</script>
