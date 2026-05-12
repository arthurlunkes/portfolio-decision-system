<template>
  <div class="h-full flex">
    <!-- Painel esquerdo — branding -->
    <div
      class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 relative overflow-hidden flex-col justify-between p-12"
    >
      <!-- Decoração de fundo -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          class="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full"
        />
        <div
          class="absolute top-1/3 -right-20 w-72 h-72 bg-white/5 rounded-full"
        />
        <div
          class="absolute -bottom-16 left-1/3 w-56 h-56 bg-white/10 rounded-full"
        />
      </div>

      <!-- Logo -->
      <div class="relative flex items-center gap-3">
        <img
          src="/logo.png"
          alt="DecisionPortfólio"
          class="w-12 h-12 rounded-2xl object-cover shadow-lg shadow-black/20"
        />
        <span class="text-white font-bold text-xl tracking-tight"
          >DecisionPortfólio</span
        >
      </div>

      <!-- Conteúdo central -->
      <div class="relative">
        <h1 class="text-4xl font-extrabold text-white leading-tight mb-4">
          Decisões inteligentes para seu portfólio
        </h1>
        <p class="text-primary-100 text-lg leading-relaxed">
          Avalie projetos com critérios linguísticos fuzzy e tome decisões
          estratégicas com base em rankings precisos pelo método VIKOR.
        </p>

        <div class="mt-10 grid grid-cols-3 gap-4">
          <div
            v-for="feature in features"
            :key="feature.label"
            class="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
          >
            <svg
              class="w-6 h-6 text-primary-200 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                :d="feature.icon"
              />
            </svg>
            <p class="text-white font-semibold text-sm">{{ feature.label }}</p>
            <p class="text-primary-200 text-xs mt-0.5">{{ feature.desc }}</p>
          </div>
        </div>
      </div>

      <!-- Rodapé -->
      <p class="relative text-primary-200 text-sm">
        © 2026 DecisionPortfólio · Todos os direitos reservados
      </p>
    </div>

    <!-- Painel direito — formulário -->
    <div
      class="relative flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 dark:bg-slate-950"
    >
      <div class="w-full max-w-sm">
        <!-- Logo mobile -->
        <div class="flex items-center gap-2 mb-10 lg:hidden">
          <img
            src="/logo.png"
            alt="DecisionPortfólio"
            class="w-8 h-8 rounded-lg object-cover"
          />
          <span class="font-bold text-gray-900 text-lg dark:text-slate-100"
            >DecisionPortfólio</span
          >
        </div>

        <h2 class="text-2xl font-bold text-gray-900 mb-1 dark:text-slate-100">
          Bem-vindo de volta
        </h2>
        <p class="text-gray-500 text-sm mb-8 dark:text-slate-400">
          Entre com suas credenciais para continuar
        </p>

        <AppAlert v-if="inactivityWarning" variant="warning" class="mb-6">
          Sua sessão expirou por inatividade. Por favor, faça login novamente.
        </AppAlert>

        <AppAlert v-if="error" variant="error" class="mb-6">
          {{ error }}
        </AppAlert>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1.5 dark:text-slate-300"
              >E-mail</label
            >
            <AppInput
              id="email"
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              required
              :error="!!error"
              autocomplete="email"
            />
          </div>

          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label
                for="password"
                class="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >Senha</label
              >
            </div>
            <div class="relative">
              <AppInput
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                required
                :error="!!error"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors dark:text-slate-500 dark:hover:text-slate-300"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="!showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
          </div>

          <AppButton
            type="submit"
            variant="primary"
            size="lg"
            :loading="loading"
            class="w-full mt-2"
          >
            Entrar
          </AppButton>

          <button
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-100 transition-colors duration-150 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200 dark:hover:bg-primary-900/50"
            @click="showContact = !showContact"
          >
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
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            {{ showContact ? "Ocultar contato" : "Contato do desenvolvedor" }}
          </button>

          <div
            v-if="showContact"
            class="rounded-2xl border border-gray-200 bg-white p-4 space-y-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p class="text-gray-700 font-semibold dark:text-slate-200">
              Arthur Lunkes
            </p>

            <a
              href="https://github.com/arthurlunkes"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              GitHub: @arthurlunkes
            </a>

            <a
              href="https://instagram.com/arthur_lunkes"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              Instagram: @arthur_lunkes
            </a>

            <a
              href="https://wa.me/5546991100092"
              target="_blank"
              rel="noopener noreferrer"
              class="block text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              WhatsApp: +55 46 99110-0092
            </a>

            <a
              href="mailto:arthur.lunkes2017@gmail.com"
              class="block text-primary-700 hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
            >
              E-mail (Gravatar): arthur.lunkes2017@gmail.com
            </a>
          </div>
        </form>
      </div>

      <div class="absolute right-6 bottom-6">
        <button
          type="button"
          class="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-150 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
          @click="toggleTheme"
        >
          <svg
            v-if="isDark"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05 5.636 5.636m12.728 0-1.414 1.414M7.05 16.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646a9.003 9.003 0 1011.708 11.708z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppAlert from "@/components/ui/AppAlert.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import { useTheme } from "@/composables/useTheme";
import { useAuthStore } from "@/stores/auth";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { isDark, toggleTheme } = useTheme();

const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const showContact = ref(false);
const inactivityWarning = ref(route.query.reason === "inactivity");

const features = [
  {
    label: "Fuzzy",
    desc: "Lógica linguística",
    icon: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  },
  {
    label: "VIKOR",
    desc: "Ranking multicriterial",
    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  },
  {
    label: "Portfólio",
    desc: "Gestão de projetos",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
];

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (err) {
    error.value = "E-mail ou senha incorretos. Tente novamente.";
  } finally {
    loading.value = false;
  }
};
</script>
