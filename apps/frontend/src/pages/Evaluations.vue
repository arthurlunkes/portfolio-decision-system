<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Page title -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Avaliações</h1>
        <p class="text-sm text-gray-500 mt-0.5">
          Avalie os projetos com termos linguísticos por critério
        </p>
      </div>

      <!-- Project Selection -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2
          class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4"
        >
          Selecionar Projeto
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
              <h4 class="font-semibold text-gray-900 text-sm">
                {{ project.name }}
              </h4>
              <span
                v-if="selectedProject?.id === project.id"
                class="shrink-0 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center mt-0.5"
              >
                <svg
                  class="w-2.5 h-2.5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <p class="text-xs text-gray-500 mt-1 line-clamp-2">
              {{ project.description }}
            </p>
            <p
              class="text-xs font-medium mt-2"
              :class="
                selectedProject?.id === project.id
                  ? 'text-primary-600'
                  : 'text-gray-400'
              "
            >
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
              <h2 class="font-bold text-gray-900">
                Avaliar: {{ selectedProject.name }}
              </h2>
              <p class="text-sm text-gray-400 mt-0.5">
                {{ completedEvaluations }} de {{ criteria.length }} critérios
                avaliados
              </p>
            </div>
            <!-- Progress bar -->
            <div class="hidden sm:flex items-center gap-3 min-w-[180px]">
              <div
                class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"
              >
                <div
                  class="h-1.5 bg-primary-500 rounded-full transition-all duration-300"
                  :style="{
                    width: (completedEvaluations / criteria.length) * 100 + '%',
                  }"
                />
              </div>
              <span class="text-xs font-semibold text-gray-500"
                >{{
                  Math.round((completedEvaluations / criteria.length) * 100)
                }}%</span
              >
            </div>
          </div>

          <div
            v-for="criterion in criteria"
            :key="criterion.id"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-semibold text-gray-900">
                    {{ criterion.name }}
                  </h4>
                  <span
                    class="px-2 py-0.5 text-xs font-semibold rounded-full"
                    :class="
                      criterion.type === 'BENEFIT'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    "
                    >{{
                      criterion.type === "BENEFIT" ? "Benefício" : "Custo"
                    }}</span
                  >
                  <span class="text-xs text-gray-400"
                    >Peso: {{ criterion.weight }}%</span
                  >
                </div>
                <p class="text-sm text-gray-500 mt-0.5">
                  {{ criterion.description }}
                </p>
              </div>
              <span
                v-if="getEvaluation(selectedProject.id, criterion.id)"
                class="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full"
              >
                ✓
                {{
                  getEvaluation(selectedProject.id, criterion.id)
                    ?.linguisticTerm
                }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <button
                v-for="term in linguisticTerms"
                :key="term.value"
                type="button"
                class="py-2.5 px-2 text-xs font-medium rounded-xl border-2 transition-all duration-150 text-center"
                :class="
                  getEvaluation(selectedProject.id, criterion.id)
                    ?.linguisticTerm === term.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 text-gray-600 hover:text-gray-900'
                "
                @click="evaluateCriterion(criterion.id, term.value)"
              >
                {{ term.label }}
              </button>
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <AppButton variant="secondary" @click="selectedProject = null">
              Voltar
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </AppButton>
            <AppButton
              variant="primary"
              :disabled="completedEvaluations !== criteria.length"
              @click="saveEvaluations"
            >
              Salvar Avaliações
            </AppButton>
          </div>
        </div>
      </Transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { useAuthStore } from "@/stores/auth";
import { getProjects } from "@/services/api/projects";
import { getCriteria } from "@/services/api/criteria";
import { getEvaluations, createEvaluation } from "@/services/api/evaluations";
import type { Evaluation as ApiEvaluation } from "@/services/api/evaluations";
import { ref, computed, onMounted } from "vue";

const authStore = useAuthStore();

interface Project {
  id: string;
  name: string;
  description: string;
}
interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  type: "BENEFIT" | "COST";
}
interface LocalEval {
  projectId: string;
  criterionId: string;
  linguisticTerm: string;
}

const selectedProject = ref<Project | null>(null);
const projects = ref<Project[]>([]);
const criteria = ref<Criterion[]>([]);
const evaluations = ref<LocalEval[]>([]);
const saving = ref(false);
const pageError = ref("");

const linguisticTerms = [
  { value: "very-low", label: "Muito Baixo" },
  { value: "low", label: "Baixo" },
  { value: "medium-low", label: "Médio-Baixo" },
  { value: "medium", label: "Médio" },
  { value: "medium-high", label: "Médio-Alto" },
  { value: "high", label: "Alto" },
  { value: "very-high", label: "Muito Alto" },
];

onMounted(async () => {
  try {
    const [p, c, e] = await Promise.all([
      getProjects(),
      getCriteria(),
      getEvaluations(),
    ]);
    projects.value = p;
    criteria.value = c;
    evaluations.value = e.map((ev: ApiEvaluation) => ({
      projectId: ev.project.id,
      criterionId: ev.criterion.id,
      linguisticTerm: ev.linguisticTerm,
    }));
  } catch {
    pageError.value = "Erro ao carregar dados.";
  }
});

const completedEvaluations = computed(() => {
  if (!selectedProject.value) return 0;
  return evaluations.value.filter(
    (e) => e.projectId === selectedProject.value!.id,
  ).length;
});

const selectProject = (project: Project) => {
  selectedProject.value = project;
};

const getEvaluation = (projectId: string, criterionId: string) =>
  evaluations.value.find(
    (e) => e.projectId === projectId && e.criterionId === criterionId,
  );

const getEvaluationStatus = (projectId: string) => {
  const count = evaluations.value.filter(
    (e) => e.projectId === projectId,
  ).length;
  return `${count} de ${criteria.value.length} critérios avaliados`;
};

const evaluateCriterion = (criterionId: string, linguisticTerm: string) => {
  if (!selectedProject.value) return;
  const existing = evaluations.value.find(
    (e) =>
      e.projectId === selectedProject.value!.id &&
      e.criterionId === criterionId,
  );
  if (existing) {
    existing.linguisticTerm = linguisticTerm;
  } else {
    evaluations.value.push({
      projectId: selectedProject.value.id,
      criterionId,
      linguisticTerm,
    });
  }
};

const saveEvaluations = async () => {
  if (!selectedProject.value) return;
  saving.value = true;
  pageError.value = "";
  try {
    const projectEvals = evaluations.value.filter(
      (e) => e.projectId === selectedProject.value!.id,
    );
    await Promise.all(
      projectEvals.map((e) =>
        createEvaluation({
          projectId: e.projectId,
          criterionId: e.criterionId,
          linguisticTerm: e.linguisticTerm,
        }),
      ),
    );
    selectedProject.value = null;
  } catch {
    pageError.value = "Erro ao salvar avaliações.";
  } finally {
    saving.value = false;
  }
};
</script>

