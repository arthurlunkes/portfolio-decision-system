import { describe, it, expect } from 'vitest'
import { VIKORCalculationService } from '../modules/vikor/services/vikor-calculation.service.js'
import { CriterionWeightService } from '../modules/criteria/services/criterion-weight.service.js'
import { TupleAggregationService } from '../modules/tuple2/services/aggregation.service.js'
import { TupleConversionService } from '../modules/tuple2/services/tuple-conversion.service.js'
import { CriterionType } from '../modules/criteria/entities/criterion.entity.js'

/**
 * Testes de regressão do motor VIKOR 2-Tuple contra a planilha de referência
 * "Bitz_Software__Seleção_e_ordenação_de_projetos.xlsx" (abas Decisor 1/2/3 e
 * "Seleção e ordenação"). Os dados de entrada são extraídos célula a célula da
 * planilha; os valores esperados também.
 *
 * NOTA SOBRE PRECISÃO (importante)
 * --------------------------------
 * A planilha representa Δj (média das importâncias) na forma 2-tuple, arredondando
 * para 1 casa decimal (ex.: Δ = 3,7). O motor deste projeto (CriterionWeightService)
 * NÃO arredonda: usa a média bruta (Δ = 11/3 = 3,6667). Isso é uma escolha de
 * precisão — não um bug — e faz os ωj/Sj/Rj/Qj divergirem da planilha a partir da
 * ~3ª/4ª casa decimal. Por isso:
 *   - O teste do serviço de pesos valida o comportamento REAL do motor (média bruta),
 *     documentando lado a lado o valor da planilha.
 *   - O teste do núcleo VIKOR (Sj/Rj/Qj) é feito de forma ISOLADA, alimentando o motor
 *     com as médias e os ωj exatos da planilha — assim verifica-se a fórmula VIKOR em si
 *     com tolerância apertada (1e-4).
 *   - O ranking final e as condições C1/C2 são robustos e batem exatamente em ambos os
 *     caminhos (planilha e pipeline bruto).
 */

// ───────────────────────────────────────────────────────────────────────────
// Dados de entrada — planilha
// ───────────────────────────────────────────────────────────────────────────

const CRITERIOS = [
  { nome: 'Alinhamento aos objetivos estratégicos', tipo: CriterionType.BENEFIT },
  { nome: 'Maximização do valor financeiro do portfólio', tipo: CriterionType.BENEFIT },
  { nome: 'Classificação do cliente (A, B, C)', tipo: CriterionType.BENEFIT },
  { nome: 'Disponibilidade de equipe qualificada', tipo: CriterionType.BENEFIT },
  { nome: 'Esforço desprendido para o desenvolvimento', tipo: CriterionType.COST },
  { nome: 'Número de clientes atendidos pela solicitação', tipo: CriterionType.BENEFIT },
  { nome: 'Entrega no prazo', tipo: CriterionType.BENEFIT },
  { nome: 'Complexidade do projeto', tipo: CriterionType.COST },
  { nome: 'Qualidade esperada do projeto', tipo: CriterionType.BENEFIT },
  { nome: 'Processo pode ser feito de outra maneira', tipo: CriterionType.BENEFIT },
]

const TYPES = CRITERIOS.map((c) => c.tipo)

// Importâncias dos critérios por decisor (EM=6 … EN=0)
const PESOS_IMPORTANCIA: Record<string, number[]> = {
  Mainara: [6, 4, 6, 2, 4, 5, 5, 4, 6, 3],
  Brunetto: [6, 3, 5, 4, 5, 5, 5, 4, 4, 3],
  Giovani: [6, 5, 4, 5, 4, 5, 6, 5, 2, 2],
}

const PROJETOS = [
  'Aplicativo para Garçom',
  'Aplicativo para Motéis',
  'Módulo de Camareira',
  'Integração com Channel Manager',
  'Assinatura digital para hóspedes no Check-in',
]

// Avaliações de desempenho por decisor (EB=6 … ER=0); colunas = ordem dos critérios
const AVALIACOES: Record<string, Record<string, number[]>> = {
  Mainara: {
    'Aplicativo para Garçom': [6, 4, 0, 3, 5, 6, 4, 5, 6, 0],
    'Aplicativo para Motéis': [5, 3, 0, 2, 5, 6, 4, 5, 6, 0],
    'Módulo de Camareira': [5, 2, 4, 3, 4, 5, 4, 4, 6, 0],
    'Integração com Channel Manager': [6, 6, 6, 4, 5, 6, 6, 6, 6, 0],
    'Assinatura digital para hóspedes no Check-in': [6, 5, 6, 4, 5, 3, 3, 5, 6, 0],
  },
  Brunetto: {
    'Aplicativo para Garçom': [6, 3, 5, 6, 5, 5, 4, 5, 4, 3],
    'Aplicativo para Motéis': [6, 4, 3, 6, 5, 6, 4, 5, 5, 4],
    'Módulo de Camareira': [5, 3, 3, 4, 3, 4, 3, 4, 4, 3],
    'Integração com Channel Manager': [5, 5, 5, 5, 5, 6, 6, 5, 6, 4],
    'Assinatura digital para hóspedes no Check-in': [6, 4, 5, 5, 6, 5, 4, 5, 5, 4],
  },
  Giovani: {
    'Aplicativo para Garçom': [5, 5, 5, 5, 4, 5, 5, 4, 5, 5],
    'Aplicativo para Motéis': [4, 4, 5, 5, 5, 5, 5, 5, 5, 5],
    'Módulo de Camareira': [4, 5, 5, 5, 5, 4, 5, 5, 5, 5],
    'Integração com Channel Manager': [5, 6, 5, 5, 5, 6, 5, 5, 5, 5],
    'Assinatura digital para hóspedes no Check-in': [5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  },
}

const DECISORES = ['Mainara', 'Brunetto', 'Giovani']
const SCALE_MAX = 6 // escala linguística 0..6 (g = scaleSize − 1)

// ───────────────────────────────────────────────────────────────────────────
// Valores esperados — planilha (aba "Seleção e ordenação")
// ───────────────────────────────────────────────────────────────────────────

// Δj — média das importâncias arredondada a 1 casa na planilha (2-tuple)
const DELTA_PLANILHA = [6.0, 4.0, 5.0, 3.7, 4.3, 5.0, 5.3, 4.3, 4.0, 2.7]
// Δj — média bruta (comportamento real do motor)
const DELTA_BRUTO = [6, 4, 5, 11 / 3, 13 / 3, 5, 16 / 3, 13 / 3, 4, 8 / 3]

// ωj normalizados (planilha, base Δ arredondado)
const OMEGA_PLANILHA = [
  0.1354401806, 0.0902934537, 0.1128668172, 0.0835214447, 0.0970654628,
  0.1128668172, 0.1196388262, 0.0970654628, 0.0902934537, 0.0609480813,
]

// Médias de desempenho agregadas (planilha) — em escala 0..6
const MEDIAS_ESPERADAS: Record<string, number[]> = {
  'Aplicativo para Garçom': [5.6667, 4.0, 3.3333, 4.6667, 4.6667, 5.3333, 4.3333, 4.6667, 5.0, 2.6667],
  'Aplicativo para Motéis': [5.0, 3.6667, 2.6667, 4.3333, 5.0, 5.6667, 4.3333, 5.0, 5.3333, 3.0],
  'Módulo de Camareira': [4.6667, 3.3333, 4.0, 4.0, 4.0, 4.3333, 4.0, 4.3333, 5.0, 2.6667],
  'Integração com Channel Manager': [5.3333, 5.6667, 5.3333, 4.6667, 5.0, 6.0, 5.6667, 5.3333, 5.6667, 3.0],
  'Assinatura digital para hóspedes no Check-in': [5.6667, 4.6667, 5.3333, 4.6667, 5.3333, 4.3333, 4.0, 5.0, 5.3333, 3.0],
}

const F_STAR_ESPERADO = [5.6667, 5.6667, 5.3333, 4.6667, 4.0, 6.0, 5.6667, 4.3333, 5.6667, 3.0]
const F_MINUS_ESPERADO = [4.6667, 3.3333, 2.6667, 4.0, 5.3333, 4.3333, 4.0, 5.3333, 5.0, 2.6667]

// Sj / Rj / Qj da planilha (base ωj da planilha)
const SJ_PLANILHA: Record<string, number> = {
  'Aplicativo para Garçom': 0.5221326454,
  'Aplicativo para Motéis': 0.6232559389,
  'Módulo de Camareira': 0.7494356659,
  'Integração com Channel Manager': 0.2150112867,
  'Assinatura digital para hóspedes no Check-in': 0.4781253359,
}
const RJ_PLANILHA: Record<string, number> = {
  'Aplicativo para Garçom': 0.095711061,
  'Aplicativo para Motéis': 0.1128668172,
  'Módulo de Camareira': 0.1354401806,
  'Integração com Channel Manager': 0.0970654628,
  'Assinatura digital para hóspedes no Check-in': 0.1196388262,
}
const QJ_PLANILHA: Record<string, number> = {
  'Aplicativo para Garçom': 0.2873384623,
  'Aplicativo para Motéis': 0.5978570971,
  'Módulo de Camareira': 1.0,
  'Integração com Channel Manager': 0.0170454546,
  'Assinatura digital para hóspedes no Check-in': 0.5473022006,
}

const RANKING_Q_ESPERADO: Record<string, number> = {
  'Integração com Channel Manager': 1,
  'Aplicativo para Garçom': 2,
  'Assinatura digital para hóspedes no Check-in': 3,
  'Aplicativo para Motéis': 4,
  'Módulo de Camareira': 5,
}

// ───────────────────────────────────────────────────────────────────────────
// Helpers — replicam o pipeline de produção (computeVIKOR) sem banco de dados
// ───────────────────────────────────────────────────────────────────────────

const weightService = new CriterionWeightService()
const aggregationService = new TupleAggregationService()
const tupleService = new TupleConversionService()
const vikor = new VIKORCalculationService()

const CRITERION_IDS = CRITERIOS.map((_, j) => `c${j}`)

/** Importâncias no formato esperado pelo CriterionWeightService. */
function buildImportances() {
  const records: { criterionId: string; evaluatorId: string; numericValue: number }[] = []
  for (const dec of DECISORES) {
    PESOS_IMPORTANCIA[dec].forEach((val, j) => {
      records.push({ criterionId: CRITERION_IDS[j], evaluatorId: dec, numericValue: val })
    })
  }
  return records
}

/** ωj calculados pelo motor real (λk = 1/3 — sem pesos de expertise configurados). */
function computeOmega(): number[] {
  const weights = weightService.compute(CRITERION_IDS, buildImportances())
  return weights.map((w) => w.omega)
}

/**
 * Matriz de decisão construída como em produção: agrega o desempenho dos 3
 * decisores (escalares normalizados) via operador 2-tuple e volta para [0,1].
 */
function buildMatrix(): number[][] {
  return PROJETOS.map((proj) =>
    CRITERIOS.map((_, j) => {
      const fuzzyValues = DECISORES.map((dec) => AVALIACOES[dec][proj][j] / SCALE_MAX)
      const aggregated = aggregationService.aggregateScalars(fuzzyValues)
      return tupleService.convert2TupleToFuzzy(aggregated)
    }),
  )
}

/** Matriz da planilha (médias em 0..6). VIKOR é invariante à escala uniforme. */
function planilhaMatrix(): number[][] {
  return PROJETOS.map((p) => MEDIAS_ESPERADAS[p])
}

const byProject = <T,>(results: { projectId: string }[], pick: (r: any) => T) => {
  const map: Record<string, T> = {}
  for (const r of results as any[]) {
    const idx = parseInt(r.projectId.split('-')[1], 10)
    map[PROJETOS[idx]] = pick(r)
  }
  return map
}

// ───────────────────────────────────────────────────────────────────────────
// Testes
// ───────────────────────────────────────────────────────────────────────────

describe('Motor VIKOR 2-Tuple — Bitz Software', () => {
  describe('Etapa 1: Cálculo dos pesos (Δ e ωj)', () => {
    const weights = weightService.compute(CRITERION_IDS, buildImportances())

    it('Δj (média bruta) corresponde à média das importâncias dos 3 decisores', () => {
      weights.forEach((w, j) => {
        expect(w.delta).toBeCloseTo(DELTA_BRUTO[j], 4)
      })
    })

    it('Δj difere da planilha apenas pelo arredondamento a 1 casa (≤ 0,034)', () => {
      weights.forEach((w, j) => {
        expect(Math.abs(w.delta - DELTA_PLANILHA[j])).toBeLessThanOrEqual(0.034)
      })
    })

    it('ωj soma exatamente 1,0', () => {
      const total = weights.reduce((s, w) => s + w.omega, 0)
      expect(total).toBeCloseTo(1.0, 10)
    })

    it('ωj fica próximo da planilha (divergência ≤ 0,002 por usar Δ bruto)', () => {
      weights.forEach((w, j) => {
        expect(Math.abs(w.omega - OMEGA_PLANILHA[j])).toBeLessThanOrEqual(0.002)
      })
    })
  })

  describe('Etapa 2: Médias de desempenho (agregação 2-tuple)', () => {
    const matrix = buildMatrix()

    it('reproduz as médias da planilha (×6) com tolerância 0,002', () => {
      matrix.forEach((row, i) => {
        const expected = MEDIAS_ESPERADAS[PROJETOS[i]]
        row.forEach((val, j) => {
          expect(val * SCALE_MAX).toBeCloseTo(expected[j], 2)
        })
      })
    })
  })

  describe('Etapa 3: Soluções ideais f* e f- (sobre a matriz da planilha)', () => {
    const matrix = planilhaMatrix()
    const numCriteria = matrix[0].length

    it('f* e f- respeitam o tipo (benefício: max/min; custo: min/max)', () => {
      for (let j = 0; j < numCriteria; j++) {
        const col = matrix.map((r) => r[j])
        const isBenefit = TYPES[j] === CriterionType.BENEFIT
        const fStar = isBenefit ? Math.max(...col) : Math.min(...col)
        const fMinus = isBenefit ? Math.min(...col) : Math.max(...col)
        expect(fStar).toBeCloseTo(F_STAR_ESPERADO[j], 3)
        expect(fMinus).toBeCloseTo(F_MINUS_ESPERADO[j], 3)
      }
    })
  })

  describe('Etapa 4: Sj e Rj (núcleo VIKOR isolado, ωj e médias da planilha)', () => {
    const results = vikor.calculateVIKOR(planilhaMatrix(), OMEGA_PLANILHA, TYPES)
    const sByProj = byProject(results, (r) => r.sValue)
    const rByProj = byProject(results, (r) => r.rValue)

    it('Sj corresponde à planilha (tolerância 1e-4)', () => {
      for (const proj of PROJETOS) {
        expect(sByProj[proj]).toBeCloseTo(SJ_PLANILHA[proj], 4)
      }
    })

    it('Rj corresponde à planilha (tolerância 1e-4)', () => {
      for (const proj of PROJETOS) {
        expect(rByProj[proj]).toBeCloseTo(RJ_PLANILHA[proj], 4)
      }
    })
  })

  describe('Etapa 5: Qj e ranking (núcleo VIKOR isolado)', () => {
    const results = vikor.calculateVIKOR(planilhaMatrix(), OMEGA_PLANILHA, TYPES)
    const qByProj = byProject(results, (r) => r.qValue)
    const rankByProj = byProject(results, (r) => r.rank)

    it('Qj corresponde à planilha (tolerância 1e-4)', () => {
      for (const proj of PROJETOS) {
        expect(qByProj[proj]).toBeCloseTo(QJ_PLANILHA[proj], 4)
      }
    })

    it('Qj fica em [0,1] e o pior caso (Camareira) é exatamente 1,0', () => {
      for (const proj of PROJETOS) {
        expect(qByProj[proj]).toBeGreaterThanOrEqual(0)
        expect(qByProj[proj]).toBeLessThanOrEqual(1)
      }
      expect(qByProj['Módulo de Camareira']).toBeCloseTo(1.0, 6)
    })

    it('o ranking por Q reproduz a ordem da planilha', () => {
      for (const proj of PROJETOS) {
        expect(rankByProj[proj]).toBe(RANKING_Q_ESPERADO[proj])
      }
    })
  })

  describe('Etapa 6: Condições C1 e C2', () => {
    const results = vikor.calculateVIKOR(planilhaMatrix(), OMEGA_PLANILHA, TYPES)
    const winner = results.find((r) => r.rank === 1)!

    it('o vencedor é a Integração com Channel Manager', () => {
      const idx = parseInt(winner.projectId.split('-')[1], 10)
      expect(PROJETOS[idx]).toBe('Integração com Channel Manager')
    })

    it('C1 (vantagem aceitável) é atendida: Q[2º]-Q[1º] ≥ 1/(J-1)=0,25', () => {
      expect(winner.c1Satisfied).toBe(true)
    })

    it('C2 (estabilidade) é atendida', () => {
      expect(winner.c2Satisfied).toBe(true)
    })

    it('a solução de compromisso é aceitável (C1 ∧ C2)', () => {
      expect(winner.c1Satisfied && winner.c2Satisfied).toBe(true)
    })
  })

  describe('Regressão end-to-end: importâncias + desempenho brutos → ranking', () => {
    // Pipeline completo como em produção: pesos via serviço + matriz agregada + VIKOR
    const omega = computeOmega()
    const matrix = buildMatrix()
    const results = vikor.calculateVIKOR(matrix, omega, TYPES)
    const rankByProj = byProject(results, (r) => r.rank)
    const qByProj = byProject(results, (r) => r.qValue)

    it('o ranking final é idêntico ao da planilha (robusto a Δ bruto vs arredondado)', () => {
      for (const proj of PROJETOS) {
        expect(rankByProj[proj]).toBe(RANKING_Q_ESPERADO[proj])
      }
    })

    it('Qj fica próximo da planilha (divergência ≤ 0,01 pela precisão de Δ bruto)', () => {
      for (const proj of PROJETOS) {
        expect(Math.abs(qByProj[proj] - QJ_PLANILHA[proj])).toBeLessThanOrEqual(0.01)
      }
    })

    it('a solução de compromisso é a Integração com Channel Manager e é aceitável', () => {
      const winner = results.find((r) => r.rank === 1)!
      const idx = parseInt(winner.projectId.split('-')[1], 10)
      expect(PROJETOS[idx]).toBe('Integração com Channel Manager')
      expect(winner.c1Satisfied && winner.c2Satisfied).toBe(true)
    })
  })
})
