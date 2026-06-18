<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Portfólios</h1>
            <p class="text-sm text-gray-500 mt-0.5">Gerencie os portfólios de projetos</p>
          </div>
          <AppButton variant="primary" @click="openCreate">
            Novo Portfólio
          </AppButton>
        </div>

        <div v-if="pageError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ pageError }}
        </div>

        <!-- Portfolio list -->
        <div v-if="portfolios.length === 0" class="text-center py-16 text-gray-400 text-sm">
          Nenhum portfólio cadastrado. Crie o primeiro para começar.
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="portfolio in portfolios"
            :key="portfolio.id"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="font-semibold text-gray-900">{{ portfolio.name }}</h3>
                <p class="text-sm text-gray-500 mt-0.5">{{ portfolio.description || '—' }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-auto pt-2 border-t border-gray-50">
              <AppButton variant="secondary" class="flex-1 text-xs" @click="openEdit(portfolio)">
                Editar
              </AppButton>
              <AppButton variant="danger" class="flex-1 text-xs" @click="confirmDelete(portfolio)">
                Excluir
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <AppModal v-model="showModal" :title="editing ? 'Editar Portfólio' : 'Novo Portfólio'">
      <form class="space-y-4" @submit.prevent="save">
        <FormField label="Nome" required>
          <AppInput v-model="form.name" placeholder="Nome do portfólio" required />
        </FormField>
        <FormField label="Descrição">
          <AppInput v-model="form.description" placeholder="Descrição (opcional)" />
        </FormField>
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="secondary" @click="closeModal">Cancelar</AppButton>
          <AppButton type="submit" variant="primary" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </AppButton>
        </div>
      </form>
    </AppModal>

    <!-- Delete Confirm Modal -->
    <AppModal v-model="showDeleteModal" title="Excluir Portfólio">
      <p class="text-sm text-gray-600 mb-4">
        Tem certeza que deseja excluir o portfólio <strong>{{ deletingPortfolio?.name }}</strong>?
        Todos os projetos, critérios e avaliações associados também serão removidos.
      </p>
      <div class="flex justify-end gap-2">
        <AppButton variant="secondary" @click="showDeleteModal = false">Cancelar</AppButton>
        <AppButton variant="danger" :disabled="saving" @click="doDelete">
          {{ saving ? 'Excluindo...' : 'Excluir' }}
        </AppButton>
      </div>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppModal from "@/components/ui/AppModal.vue";
import FormField from "@/components/ui/FormField.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import { useAuthStore } from "@/stores/auth";
import {
  getPortfolios,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  type Portfolio,
} from "@/services/api/portfolios";
import { ref, onMounted } from "vue";

const authStore = useAuthStore();

const portfolios = ref<Portfolio[]>([]);
const showModal = ref(false);
const showDeleteModal = ref(false);
const saving = ref(false);
const pageError = ref("");
const editing = ref<Portfolio | null>(null);
const deletingPortfolio = ref<Portfolio | null>(null);
const form = ref({ name: "", description: "" });

onMounted(async () => {
  try {
    portfolios.value = await getPortfolios();
  } catch {
    pageError.value = "Erro ao carregar portfólios.";
  }
});

function openCreate() {
  editing.value = null;
  form.value = { name: "", description: "" };
  showModal.value = true;
}

function openEdit(p: Portfolio) {
  editing.value = p;
  form.value = { name: p.name, description: p.description };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function confirmDelete(p: Portfolio) {
  deletingPortfolio.value = p;
  showDeleteModal.value = true;
}

async function save() {
  saving.value = true;
  pageError.value = "";
  try {
    if (editing.value) {
      const updated = await updatePortfolio(editing.value.id, form.value);
      const idx = portfolios.value.findIndex((p) => p.id === editing.value!.id);
      if (idx !== -1) portfolios.value[idx] = updated;
    } else {
      const created = await createPortfolio(form.value);
      portfolios.value.push(created);
    }
    closeModal();
  } catch {
    pageError.value = "Erro ao salvar portfólio.";
  } finally {
    saving.value = false;
  }
}

async function doDelete() {
  if (!deletingPortfolio.value) return;
  saving.value = true;
  try {
    await deletePortfolio(deletingPortfolio.value.id);
    portfolios.value = portfolios.value.filter((p) => p.id !== deletingPortfolio.value!.id);
    showDeleteModal.value = false;
  } catch {
    pageError.value = "Erro ao excluir portfólio.";
  } finally {
    saving.value = false;
  }
}
</script>
