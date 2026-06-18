import { ref, onMounted } from 'vue'
import { getPortfolios, type Portfolio } from '@/services/api/portfolios'

export function usePortfolioContext() {
  const portfolios = ref<Portfolio[]>([])
  const selectedPortfolioId = ref<string>('')
  const loadingPortfolios = ref(false)

  onMounted(async () => {
    loadingPortfolios.value = true
    try {
      portfolios.value = await getPortfolios()
      if (portfolios.value.length > 0 && !selectedPortfolioId.value) {
        selectedPortfolioId.value = portfolios.value[0].id
      }
    } finally {
      loadingPortfolios.value = false
    }
  })

  return { portfolios, selectedPortfolioId, loadingPortfolios }
}
