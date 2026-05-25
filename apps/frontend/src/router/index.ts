import Criteria from "@/pages/Criteria.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Evaluations from "@/pages/Evaluations.vue";
import Login from "@/pages/Login.vue";
import Profile from "@/pages/Profile.vue";
import Projects from "@/pages/Projects.vue";
import Results from "@/pages/Results.vue";
import RolesManager from "@/pages/RolesManager.vue";
import Users from "@/pages/Users.vue";
import { isSessionExpired } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

type SeoMeta = {
  title: string;
  description: string;
  robots?: string;
};

const DEFAULT_SEO: SeoMeta = {
  title: "Portfolio Decision System | Analise Multicriterio",
  description:
    "Sistema de apoio a decisao para selecao de portfolio de projetos com metodos multicriterio como Fuzzy e VIKOR.",
  robots: "index,follow,max-image-preview:large",
};

const SEO_BY_ROUTE: Record<string, SeoMeta> = {
  Login: {
    title: "Login | Portfolio Decision System",
    description:
      "Acesse o sistema para gerenciar portfolio de projetos e executar analises multicriterio.",
    robots: "noindex,nofollow",
  },
  Dashboard: {
    title: "Dashboard | Portfolio Decision System",
    description:
      "Visao geral dos indicadores e desempenho do portfolio de projetos.",
    robots: "noindex,nofollow",
  },
  Projects: {
    title: "Projetos | Portfolio Decision System",
    description:
      "Cadastre e acompanhe projetos para avaliacao multicriterio no portfolio.",
    robots: "noindex,nofollow",
  },
  Criteria: {
    title: "Criterios | Portfolio Decision System",
    description:
      "Defina criterios e pesos para priorizacao e tomada de decisao em portfolio.",
    robots: "noindex,nofollow",
  },
  Evaluations: {
    title: "Avaliacoes | Portfolio Decision System",
    description:
      "Registre avaliacoes de projetos e dados de entrada para calculos de ranking.",
    robots: "noindex,nofollow",
  },
  Results: {
    title: "Resultados | Portfolio Decision System",
    description:
      "Visualize resultados de priorizacao do portfolio com metodo VIKOR e fuzzy mapping.",
    robots: "noindex,nofollow",
  },
  Users: {
    title: "Usuarios | Portfolio Decision System",
    description:
      "Gerencie usuarios e permissoes para operacao do sistema de decisao.",
    robots: "noindex,nofollow",
  },
  Profile: {
    title: "Perfil | Portfolio Decision System",
    description:
      "Atualize dados do perfil e preferencias de acesso no sistema.",
    robots: "noindex,nofollow",
  },
};

const upsertMetaTag = (
  selector: string,
  attributeName: "name" | "property",
  attributeValue: string,
  content: string,
) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
};

const upsertCanonicalTag = (href: string) => {
  let canonical = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }

  canonical.setAttribute("href", href);
};

const updateSeoForRoute = (routeName?: string, routePath?: string) => {
  const seo = (routeName && SEO_BY_ROUTE[routeName]) || DEFAULT_SEO;
  const canonicalUrl = `${window.location.origin}${routePath ?? window.location.pathname}`;

  document.title = seo.title;
  upsertMetaTag(
    'meta[name="description"]',
    "name",
    "description",
    seo.description,
  );
  upsertMetaTag(
    'meta[name="robots"]',
    "name",
    "robots",
    seo.robots ?? DEFAULT_SEO.robots ?? "index,follow",
  );

  upsertMetaTag('meta[property="og:title"]', "property", "og:title", seo.title);
  upsertMetaTag(
    'meta[property="og:description"]',
    "property",
    "og:description",
    seo.description,
  );
  upsertMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);

  upsertMetaTag(
    'meta[name="twitter:title"]',
    "name",
    "twitter:title",
    seo.title,
  );
  upsertMetaTag(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    seo.description,
  );

  upsertCanonicalTag(canonicalUrl);
};

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects",
    name: "Projects",
    component: Projects,
    meta: { requiresAuth: true },
  },
  {
    path: "/criteria",
    name: "Criteria",
    component: Criteria,
    meta: { requiresAuth: true },
  },
  {
    path: "/evaluations",
    name: "Evaluations",
    component: Evaluations,
    meta: { requiresAuth: true },
  },
  {
    path: "/results",
    name: "Results",
    component: Results,
    meta: { requiresAuth: true },
  },
  {
    path: "/users",
    name: "Users",
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/roles",
    name: "RolesManager",
    component: RolesManager,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem("auth.token");
  const authenticated = !!token && !isSessionExpired();

  if (!authenticated && token) {
    // Token present but session expired — clean up
    sessionStorage.removeItem("auth.token");
    sessionStorage.removeItem("auth.user");
    sessionStorage.removeItem("auth.lastActivity");
  }

  if (to.meta.requiresAuth && !authenticated) {
    next("/login");
  } else if (to.path === "/login" && authenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

router.afterEach((to) => {
  updateSeoForRoute(to.name?.toString(), to.fullPath);
});

export default router;
