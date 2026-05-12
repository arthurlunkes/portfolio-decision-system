<template>
  <div class="h-full bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader @logout="authStore.logout()" />

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <!-- Cabeçalho -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white border border-transparent hover:border-gray-200 transition-all"
          @click="$router.back()"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p class="text-sm text-gray-500 mt-0.5">
            Gerencie suas informações pessoais
          </p>
        </div>
      </div>

      <!-- Avatar e info -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center gap-5">
          <AppAvatar
            :name="currentUser?.name || 'U'"
            size="lg"
            class="!w-16 !h-16 !text-xl"
          />
          <div>
            <p class="text-xl font-bold text-gray-900">
              {{ currentUser?.name }}
            </p>
            <p class="text-sm text-gray-500">{{ currentUser?.email }}</p>
            <AppBadge
              :variant="roleBadgeVariant(currentUser?.role)"
              class="mt-2"
            >
              {{ roleLabel(currentUser?.role) }}
            </AppBadge>
          </div>
        </div>
      </div>

      <!-- Formulário de dados -->
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        <h2 class="text-base font-semibold text-gray-900">
          Informações Pessoais
        </h2>

        <AppAlert v-if="profileError" variant="error" :message="profileError" />
        <AppAlert
          v-if="profileSuccess"
          variant="success"
          :message="profileSuccess"
        />

        <form class="space-y-4" @submit.prevent="saveProfile">
          <FormField label="Nome completo" required>
            <AppInput
              v-model="profileForm.name"
              placeholder="Seu nome completo"
              required
            />
          </FormField>

          <FormField label="E-mail" required>
            <AppInput
              v-model="profileForm.email"
              type="email"
              placeholder="seu@email.com"
              required
            />
          </FormField>

          <FormField label="Papel">
            <div class="grid grid-cols-3 gap-2">
              <label
                v-for="role in roles"
                :key="role.value"
                class="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all"
                :class="
                  profileForm.role === role.value
                    ? role.activeClass
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                "
              >
                <input
                  v-model="profileForm.role"
                  type="radio"
                  :value="role.value"
                  class="sr-only"
                />
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
                    :d="role.icon"
                  />
                </svg>
                <span class="text-xs font-semibold">{{ role.label }}</span>
              </label>
            </div>
          </FormField>

          <div class="flex justify-end gap-3 pt-1">
            <AppButton
              type="button"
              variant="secondary"
              @click="resetProfileForm"
            >
              Cancelar
            </AppButton>
            <AppButton type="submit" variant="primary" :loading="savingProfile">
              Salvar Alterações
            </AppButton>
          </div>
        </form>
      </div>

      <!-- Formulário de senha -->
      <div
        class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        <h2 class="text-base font-semibold text-gray-900">Alterar Senha</h2>

        <AppAlert
          v-if="passwordError"
          variant="error"
          :message="passwordError"
        />
        <AppAlert
          v-if="passwordSuccess"
          variant="success"
          :message="passwordSuccess"
        />

        <form class="space-y-4" @submit.prevent="savePassword">
          <FormField label="Nova Senha" required>
            <div class="relative">
              <AppInput
                v-model="passwordForm.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                @click="showNewPassword = !showNewPassword"
              >
                <svg
                  v-if="showNewPassword"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
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
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
          </FormField>

          <FormField label="Confirmar Nova Senha" required>
            <AppInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Repita a nova senha"
              required
            />
          </FormField>

          <div class="flex justify-end gap-3 pt-1">
            <AppButton
              type="button"
              variant="secondary"
              @click="resetPasswordForm"
            >
              Cancelar
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              :loading="savingPassword"
            >
              Alterar Senha
            </AppButton>
          </div>
        </form>
      </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from "@/components/layout/AppHeader.vue";
import AppAlert from "@/components/ui/AppAlert.vue";
import AppAvatar from "@/components/ui/AppAvatar.vue";
import AppBadge from "@/components/ui/AppBadge.vue";
import AppButton from "@/components/ui/AppButton.vue";
import AppInput from "@/components/ui/AppInput.vue";
import FormField from "@/components/ui/FormField.vue";
import { updateProfile, updateProfilePassword } from "@/services/api/profile";
import type { UserRole } from "@/services/api/users";
import { useAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";

const authStore = useAuthStore();
const currentUser = computed(
  () =>
    authStore.user as {
      id: string;
      name: string;
      email: string;
      role: UserRole;
    } | null,
);

// -- Profile form --
const profileForm = ref({
  name: currentUser.value?.name ?? "",
  email: currentUser.value?.email ?? "",
  role: (currentUser.value?.role ?? "DECISOR") as UserRole,
});

const roles: {
  value: UserRole;
  label: string;
  icon: string;
  activeClass: string;
}[] = [
  {
    value: "ADMIN",
    label: "Admin",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    activeClass: "border-purple-500 bg-purple-50 text-purple-700",
  },
  {
    value: "DECISOR",
    label: "Decisor",
    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    activeClass: "border-primary-500 bg-primary-50 text-primary-700",
  },
  {
    value: "VIEWER",
    label: "Visualizador",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    activeClass: "border-gray-500 bg-gray-100 text-gray-700",
  },
];

const profileError = ref("");
const profileSuccess = ref("");
const savingProfile = ref(false);

const resetProfileForm = () => {
  profileForm.value = {
    name: currentUser.value?.name ?? "",
    email: currentUser.value?.email ?? "",
    role: (currentUser.value?.role ?? "DECISOR") as UserRole,
  };
  profileError.value = "";
  profileSuccess.value = "";
};

const saveProfile = async () => {
  profileError.value = "";
  profileSuccess.value = "";
  if (!currentUser.value) return;

  savingProfile.value = true;
  try {
    const updated = await updateProfile(currentUser.value.id, {
      name: profileForm.value.name,
      email: profileForm.value.email,
      role: profileForm.value.role,
      active: true,
    });
    authStore.user = updated;
    sessionStorage.setItem("auth.user", JSON.stringify(updated));
    profileSuccess.value = "Perfil atualizado com sucesso!";
  } catch (e: any) {
    profileError.value = e.message ?? "Erro ao atualizar perfil.";
  } finally {
    savingProfile.value = false;
  }
};

// -- Password form --
const passwordForm = ref({ newPassword: "", confirmPassword: "" });
const passwordError = ref("");
const passwordSuccess = ref("");
const savingPassword = ref(false);
const showNewPassword = ref(false);

const resetPasswordForm = () => {
  passwordForm.value = { newPassword: "", confirmPassword: "" };
  passwordError.value = "";
  passwordSuccess.value = "";
};

const savePassword = async () => {
  passwordError.value = "";
  passwordSuccess.value = "";
  if (!currentUser.value) return;

  if (passwordForm.value.newPassword.length < 8) {
    passwordError.value = "A senha deve ter pelo menos 8 caracteres.";
    return;
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordError.value = "As senhas não coincidem.";
    return;
  }

  savingPassword.value = true;
  try {
    await updateProfilePassword(
      currentUser.value.id,
      passwordForm.value.newPassword,
    );
    passwordSuccess.value = "Senha alterada com sucesso!";
    resetPasswordForm();
  } catch (e: any) {
    passwordError.value = e.message ?? "Erro ao alterar senha.";
  } finally {
    savingPassword.value = false;
  }
};

// -- Helpers --
const roleLabel = (role?: string) =>
  (
    ({
      ADMIN: "Administrador",
      DECISOR: "Decisor",
      VIEWER: "Visualizador",
    }) as Record<string, string>
  )[role ?? ""] ??
  role ??
  "";

const roleBadgeVariant = (role?: string): "purple" | "primary" | "gray" =>
  (
    ({ ADMIN: "purple", DECISOR: "primary", VIEWER: "gray" }) as Record<
      string,
      "purple" | "primary" | "gray"
    >
  )[role ?? ""] ?? "gray";
</script>
