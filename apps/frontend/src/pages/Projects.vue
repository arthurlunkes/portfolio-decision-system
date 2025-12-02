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
            <h1 class="text-2xl font-bold text-gray-900">Projetos</h1>
          </div>
          <button
            @click="showAddModal = true"
            class="btn-primary"
          >
            Adicionar Projeto
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Search and Filter -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Buscar projetos..."
            class="input-field"
          />
        </div>
      </div>

      <!-- Projects Table -->
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
                  Data de Criação
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="project in filteredProjects" :key="project.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ project.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ project.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-500">{{ formatDate(project.createdAt) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="editProject(project)"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteProject(project)"
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
          {{ showEditModal ? 'Editar Projeto' : 'Adicionar Projeto' }}
        </h3>
        <form @submit.prevent="saveProject">
          <div class="mb-4">
            <label for="projectName" class="block text-sm font-medium text-gray-700 mb-2">
              Nome
            </label>
            <input
              id="projectName"
              v-model="projectForm.name"
              type="text"
              required
              class="input-field"
            />
          </div>
          <div class="mb-6">
            <label for="projectDescription" class="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              id="projectDescription"
              v-model="projectForm.description"
              rows="3"
              required
              class="input-field"
            ></textarea>
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

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
}

const searchTerm = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)

const projectForm = ref({
  id: '',
  name: '',
  description: ''
})

const projects = ref<Project[]>([
  {
    id: '1',
    name: 'Sistema de Gestão ERP',
    description: 'Desenvolvimento de sistema ERP integrado para gestão empresarial',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Aplicativo Mobile',
    description: 'Aplicativo mobile para gestão de tarefas e produtividade',
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'Portal Web E-commerce',
    description: 'Desenvolvimento de plataforma de e-commerce B2B',
    createdAt: '2024-01-25'
  }
])

const filteredProjects = computed(() => {
  if (!searchTerm.value) return projects.value
  return projects.value.filter(project =>
    project.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR')
}

const editProject = (project: Project) => {
  projectForm.value = { ...project }
  showEditModal.value = true
}

const deleteProject = (project: Project) => {
  if (confirm(`Tem certeza que deseja excluir o projeto "${project.name}"?`)) {
    projects.value = projects.value.filter(p => p.id !== project.id)
  }
}

const saveProject = () => {
  if (showEditModal.value) {
    const index = projects.value.findIndex(p => p.id === projectForm.value.id)
    if (index !== -1) {
      projects.value[index] = { ...projectForm.value }
    }
  } else {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectForm.value.name,
      description: projectForm.value.description,
      createdAt: new Date().toISOString().split('T')[0]
    }
    projects.value.push(newProject)
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  projectForm.value = {
    id: '',
    name: '',
    description: ''
  }
}
</script>