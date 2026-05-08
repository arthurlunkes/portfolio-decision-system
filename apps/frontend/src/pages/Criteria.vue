<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader @logout="authStore.logout()" />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Page title + action -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Critérios</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Defina os critérios de avaliação e seus pesos
          </p>
        </div>
        <AppButton variant="primary" @click="showAddModal = true">
          Adicionar Critério
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
              d="M12 4v16m8-8H4"
            />
          </svg>
        </AppButton>
      </div>

      <!-- Weight Validation Alert -->
      <AppAlert v-if="!isWeightValid" variant="warning">
        A soma total dos pesos deve ser igual a 100%. Atual:
        <strong>{{ totalWeight }}%</strong>
      </AppAlert>

      <!-- Peso total indicador -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-2 rounded-full transition-all duration-300"
            :class="
              isWeightValid
                ? 'bg-green-500'
                : totalWeight > 100
                  ? 'bg-red-500'
                  : 'bg-amber-400'
            "
            :style="{ width: Math.min(totalWeight, 100) + '%' }"
          />
        </div>
        <span
          class="text-sm font-semibold"
          :class="isWeightValid ? 'text-green-600' : 'text-amber-600'"
        >
          {{ totalWeight }}% / 100%
        </span>
      </div>

      <!-- Table card -->
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50/60">
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Nome
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Descrição
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Peso
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Tipo
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="criteria.length === 0">
                <td
                  colspan="5"
                  class="px-6 py-12 text-center text-sm text-gray-400"
                >
                  Nenhum critério cadastrado.
                </td>
              </tr>
              <tr
                v-for="criterion in criteria"
                :key="criterion.id"
                class="hover:bg-gray-50/60 transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="font-semibold text-gray-900 text-sm">{{
                    criterion.name
                  }}</span>
                </td>
                <td class="px-6 py-4 max-w-xs">
                  <span class="text-sm text-gray-500 line-clamp-1">{{
                    criterion.description
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"
                    >
                      <div
                        class="bg-primary-500 h-1.5 rounded-full"
                        :style="{ width: criterion.weight + '%' }"
                      />
                    </div>
                    <span class="text-sm font-medium text-gray-700"
                      >{{ criterion.weight }}%</span
                    >
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2.5 py-1 text-xs font-semibold rounded-full"
                    :class="
                      criterion.type === 'BENEFIT'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    "
                  >
                    {{ criterion.type === "BENEFIT" ? "Benefício" : "Custo" }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <AppButton
                      variant="ghost"
                      size="sm"
                      @click="editCriterion(criterion)"
                      >Editar</AppButton
                    >
                    <AppButton
                      variant="danger"
                      size="sm"
                      @click="deleteCriterion(criterion)"
                      >Excluir</AppButton
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showAddModal || showEditModal"
          class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          @click.self="closeModal"
        >
          <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div
              class="flex items-center justify-between px-6 py-5 border-b border-gray-100"
            >
              <h3 class="text-lg font-bold text-gray-900">
                {{ showEditModal ? "Editar Critério" : "Novo Critério" }}
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 transition-colors"
                @click="closeModal"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form class="px-6 py-5 space-y-4" @submit.prevent="saveCriterion">
              <div>
                <label
                  for="criterionName"
                  class="block text-sm font-medium text-gray-700 mb-1.5"
                  >Nome</label
                >
                <AppInput
                  id="criterionName"
                  v-model="criterionForm.name"
                  type="text"
                  placeholder="Nome do critério"
                  required
                />
              </div>
              <div>
                <label
                  for="criterionDescription"
                  class="block text-sm font-medium text-gray-700 mb-1.5"
                  >Descrição</label
                >
                <textarea
                  id="criterionDescription"
                  v-model="criterionForm.description"
                  rows="3"
                  required
                  placeholder="Descreva o critério..."
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
              </div>
              <div>
                <label
                  for="criterionWeight"
                  class="block text-sm font-medium text-gray-700 mb-1.5"
                  >Peso (%)</label
                >
                <AppInput
                  id="criterionWeight"
                  v-model="criterionForm.weight"
                  type="number"
                  placeholder="Ex: 25"
                  required
                />
              </div>
              <div>
                <p class="block text-sm font-medium text-gray-700 mb-2">Tipo</p>
                <div class="grid grid-cols-2 gap-3">
                  <label
                    class="flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                    :class="
                      criterionForm.type === 'BENEFIT'
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    "
                  >
                    <input
                      v-model="criterionForm.type"
                      type="radio"
                      value="BENEFIT"
                      class="sr-only"
                    />
                    <span
                      class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      :class="
                        criterionForm.type === 'BENEFIT'
                          ? 'border-green-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="criterionForm.type === 'BENEFIT'"
                        class="w-2 h-2 rounded-full bg-green-500"
                      />
                    </span>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">
                        Benefício
                      </p>
                      <p class="text-xs text-gray-400">Maior = melhor</p>
                    </div>
                  </label>
                  <label
                    class="flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all"
                    :class="
                      criterionForm.type === 'COST'
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    "
                  >
                    <input
                      v-model="criterionForm.type"
                      type="radio"
                      value="COST"
                      class="sr-only"
                    />
                    <span
                      class="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                      :class="
                        criterionForm.type === 'COST'
                          ? 'border-red-500'
                          : 'border-gray-300'
                      "
                    >
                      <span
                        v-if="criterionForm.type === 'COST'"
                        class="w-2 h-2 rounded-full bg-red-500"
                      />
                    </span>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">Custo</p>
                      <p class="text-xs text-gray-400">Menor = melhor</p>
                    </div>
                  </label>
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <AppButton type="button" variant="secondary" @click="closeModal"
                  >Cancelar</AppButton
                >
                <AppButton type="submit" variant="primary">
                  {{ showEditModal ? "Atualizar" : "Adicionar" }}
                </AppButton>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import AppAlert from "@/components/ui/AppAlert.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppInput from "@/components/ui/AppInput.vue";
import { useAuthStore } from "@/stores/auth";
import {
  createCriterion as apiCreate,
  deleteCriterion as apiDelete,
  getCriteria,
  updateCriterion as apiUpdate,
} from "@/services/api/criteria";
import type { Criterion } from "@/services/api/criteria";
import { ref, computed, onMounted } from "vue";

const authStore = useAuthStore();

const showAddModal = ref(false);
const showEditModal = ref(false);
const loading = ref(false);
const pageError = ref("");

const criterionForm = ref({
  id: "",
  name: "",
  description: "",
  weight: "10",
  type: "BENEFIT" as "BENEFIT" | "COST",
});

const criteria = ref<Criterion[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    criteria.value = await getCriteria();
  } catch {
    pageError.value = "Erro ao carregar critérios.";
  } finally {
    loading.value = false;
  }
});

const totalWeight = computed(() => {
  return criteria.value.reduce((sum, criterion) => sum + criterion.weight, 0);
});

const isWeightValid = computed(() => {
  return totalWeight.value === 100;
});

const editCriterion = (criterion: Criterion) => {
  criterionForm.value = { ...criterion, weight: String(criterion.weight) };
  showEditModal.value = true;
};

const deleteCriterion = async (criterion: Criterion) => {
  if (
    !confirm(`Tem certeza que deseja excluir o critério "${criterion.name}"?`)
  )
    return;
  try {
    await apiDelete(criterion.id);
    criteria.value = criteria.value.filter((c) => c.id !== criterion.id);
  } catch {
    pageError.value = "Erro ao excluir critério.";
  }
};

const saveCriterion = async () => {
  try {
    if (showEditModal.value) {
      const updated = await apiUpdate(criterionForm.value.id, {
        name: criterionForm.value.name,
        description: criterionForm.value.description,
        weight: Number(criterionForm.value.weight),
        type: criterionForm.value.type,
      });
      const idx = criteria.value.findIndex((c) => c.id === updated.id);
      if (idx !== -1) criteria.value[idx] = updated;
    } else {
      const created = await apiCreate({
        name: criterionForm.value.name,
        description: criterionForm.value.description,
        weight: Number(criterionForm.value.weight),
        type: criterionForm.value.type,
      });
      criteria.value.push(created);
    }
    closeModal();
  } catch {
    pageError.value = "Erro ao salvar critério.";
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  criterionForm.value = {
    id: "",
    name: "",
    description: "",
    weight: "10",
    type: "BENEFIT",
  };
};
</script>

