<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Page title + action -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Projetos</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Gerencie os projetos do portfólio
          </p>
        </div>
        <AppButton variant="primary" @click="showAddModal = true">
          Adicionar Projeto
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

      <!-- Search -->
      <div class="max-w-sm">
        <AppInput
          v-model="searchTerm"
          type="text"
          placeholder="Buscar projetos..."
        />
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
                  Criado em
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-if="filteredProjects.length === 0">
                <td
                  colspan="4"
                  class="px-6 py-12 text-center text-sm text-gray-400"
                >
                  Nenhum projeto encontrado.
                </td>
              </tr>
              <tr
                v-for="project in filteredProjects"
                :key="project.id"
                class="hover:bg-gray-50/60 transition-colors"
              >
                <td class="px-6 py-4">
                  <span class="font-semibold text-gray-900 text-sm">{{
                    project.name
                  }}</span>
                </td>
                <td class="px-6 py-4 max-w-xs">
                  <span class="text-sm text-gray-500 line-clamp-1">{{
                    project.description
                  }}</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-sm text-gray-500">{{
                    formatDate(project.createdAt)
                  }}</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <AppButton
                      variant="ghost"
                      size="sm"
                      @click="editProject(project)"
                      >Editar</AppButton
                    >
                    <AppButton
                      variant="danger"
                      size="sm"
                      @click="deleteProject(project)"
                      >Excluir</AppButton
                    >
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
                {{ showEditModal ? "Editar Projeto" : "Novo Projeto" }}
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
            <form class="px-6 py-5 space-y-4" @submit.prevent="saveProject">
              <div>
                <label
                  for="projectName"
                  class="block text-sm font-medium text-gray-700 mb-1.5"
                  >Nome</label
                >
                <AppInput
                  id="projectName"
                  v-model="projectForm.name"
                  type="text"
                  placeholder="Nome do projeto"
                  required
                />
              </div>
              <div>
                <label
                  for="projectDescription"
                  class="block text-sm font-medium text-gray-700 mb-1.5"
                  >Descrição</label
                >
                <textarea
                  id="projectDescription"
                  v-model="projectForm.description"
                  rows="3"
                  required
                  placeholder="Descreva o projeto..."
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm transition-all outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                />
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
import AppHeader from "@/components/layout/AppHeader.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import type { Project } from "@/services/api/projects";
import {
  createProject as apiCreate,
  deleteProject as apiDelete,
  updateProject as apiUpdate,
  getProjects,
} from "@/services/api/projects";
import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, ref } from "vue";

const authStore = useAuthStore();

const searchTerm = ref("");
const showAddModal = ref(false);
const showEditModal = ref(false);
const loading = ref(false);
const pageError = ref("");

const projectForm = ref({
  id: "",
  name: "",
  description: "",
  createdAt: "",
});

const projects = ref<Project[]>([]);

onMounted(async () => {
  loading.value = true;
  try {
    projects.value = await getProjects();
  } catch {
    pageError.value = "Erro ao carregar projetos.";
  } finally {
    loading.value = false;
  }
});

const filteredProjects = computed(() => {
  if (!searchTerm.value) return projects.value;
  return projects.value.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      project.description
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase()),
  );
});

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
};

const editProject = (project: Project) => {
  projectForm.value = { ...project };
  showEditModal.value = true;
};

const deleteProject = async (project: Project) => {
  if (!confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`))
    return;
  try {
    await apiDelete(project.id);
    projects.value = projects.value.filter((p) => p.id !== project.id);
  } catch {
    pageError.value = "Erro ao excluir projeto.";
  }
};

const saveProject = async () => {
  try {
    if (showEditModal.value) {
      const updated = await apiUpdate(projectForm.value.id, {
        name: projectForm.value.name,
        description: projectForm.value.description,
      });
      const idx = projects.value.findIndex((p) => p.id === updated.id);
      if (idx !== -1) projects.value[idx] = updated;
    } else {
      const created = await apiCreate({
        name: projectForm.value.name,
        description: projectForm.value.description,
      });
      projects.value.push(created);
    }
    closeModal();
  } catch {
    pageError.value = "Erro ao salvar projeto.";
  }
};

const closeModal = () => {
  showAddModal.value = false;
  showEditModal.value = false;
  projectForm.value = {
    id: "",
    name: "",
    description: "",
    createdAt: "",
  };
};
</script>

