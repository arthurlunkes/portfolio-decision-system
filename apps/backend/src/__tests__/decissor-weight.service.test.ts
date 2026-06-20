import { describe, it, expect } from 'vitest'
import {
  DecissorWeightService,
  EXPERTISE_SCALE,
  EXPERTISE_LABELS,
  DEFAULT_WEIGHT_LINGUISTIC,
  DEFAULT_WEIGHT_NUMERIC,
} from '../modules/decissor/services/decissor-weight.service.js'

describe('DecissorWeightService', () => {
  const service = new DecissorWeightService()

  describe('escala linguística', () => {
    it('EN = 0 (menor importância)', () => {
      expect(service.getNumericValue('EN')).toBe(0)
    })
    it('IM = 4 (padrão)', () => {
      expect(service.getNumericValue('IM')).toBe(DEFAULT_WEIGHT_NUMERIC)
      expect(DEFAULT_WEIGHT_LINGUISTIC).toBe('IM')
    })
    it('EM = 6 (maior importância)', () => {
      expect(service.getNumericValue('EM')).toBe(6)
    })
    it('MI = 5', () => {
      expect(service.getNumericValue('MI')).toBe(5)
    })
    it('escala tem 7 termos', () => {
      expect(service.getAvailableTerms()).toHaveLength(7)
    })
    it('lança erro para termo desconhecido', () => {
      expect(() => service.getNumericValue('ZZ')).toThrow()
    })
  })

  describe('normalise', () => {
    it('pesos iguais → [1/n, …, 1/n]', () => {
      const result = service.normalise([4, 4, 4])
      expect(result.every((v) => Math.abs(v - 1 / 3) < 1e-9)).toBe(true)
    })

    it('exemplo do artigo: EM(6), MI(5), IM(4)', () => {
      const result = service.normalise([6, 5, 4])
      const total = 15
      expect(result[0]).toBeCloseTo(6 / total)   // λMainara ≈ 0.400
      expect(result[1]).toBeCloseTo(5 / total)   // λBrunetto ≈ 0.333
      expect(result[2]).toBeCloseTo(4 / total)   // λGiovani  ≈ 0.267
    })

    it('soma dos pesos normalizados = 1', () => {
      const result = service.normalise([6, 5, 4])
      expect(result.reduce((s, v) => s + v, 0)).toBeCloseTo(1)
    })

    it('fallback para pesos iguais quando todos são 0', () => {
      const result = service.normalise([0, 0, 0])
      expect(result.every((v) => Math.abs(v - 1 / 3) < 1e-9)).toBe(true)
    })
  })

  describe('buildLambdaMap', () => {
    it('retorna mapa correto para 3 decisores', () => {
      const entries = [
        { evaluatorId: 'mainara', weightNumeric: 6 },
        { evaluatorId: 'brunetto', weightNumeric: 5 },
        { evaluatorId: 'giovani', weightNumeric: 4 },
      ]
      const map = service.buildLambdaMap(entries)
      expect(map.get('mainara')).toBeCloseTo(6 / 15)
      expect(map.get('brunetto')).toBeCloseTo(5 / 15)
      expect(map.get('giovani')).toBeCloseTo(4 / 15)
    })

    it('pesos iguais quando todos têm o mesmo βk (caso idêntico à média simples)', () => {
      const entries = [
        { evaluatorId: 'a', weightNumeric: 4 },
        { evaluatorId: 'b', weightNumeric: 4 },
        { evaluatorId: 'c', weightNumeric: 4 },
      ]
      const map = service.buildLambdaMap(entries)
      expect(map.get('a')).toBeCloseTo(1 / 3)
      expect(map.get('b')).toBeCloseTo(1 / 3)
      expect(map.get('c')).toBeCloseTo(1 / 3)
    })

    it('fallback para pesos iguais quando todos são 0', () => {
      const entries = [
        { evaluatorId: 'x', weightNumeric: 0 },
        { evaluatorId: 'y', weightNumeric: 0 },
      ]
      const map = service.buildLambdaMap(entries)
      expect(map.get('x')).toBeCloseTo(0.5)
      expect(map.get('y')).toBeCloseTo(0.5)
    })

    it('mapa de avaliador único → λk = 1', () => {
      const map = service.buildLambdaMap([{ evaluatorId: 'solo', weightNumeric: 5 }])
      expect(map.get('solo')).toBeCloseTo(1)
    })
  })
})

// Propriedade: pesos λk ponderados produzem resultado idêntico à média quando todos iguais
describe('Propriedade: pesos iguais ↔ média aritmética simples', () => {
  it('λk = 1/n quando todos os decisores têm o mesmo grau', () => {
    const service = new DecissorWeightService()
    const n = 5
    const entries = Array.from({ length: n }, (_, i) => ({
      evaluatorId: `user-${i}`,
      weightNumeric: 4,
    }))
    const map = service.buildLambdaMap(entries)
    for (const [, lambda] of map) {
      expect(lambda).toBeCloseTo(1 / n)
    }
  })

  it('β̄ com λk iguais = média simples dos valores fuzzy', () => {
    // Simula 3 decisores com avaliações [0.5, 0.8, 0.2] e λk = 1/3
    const fuzzyValues = [0.5, 0.8, 0.2]
    const lambdas = [1 / 3, 1 / 3, 1 / 3]
    const weightedAvg = fuzzyValues.reduce((s, v, i) => s + lambdas[i] * v, 0)
    const simpleAvg = fuzzyValues.reduce((s, v) => s + v, 0) / fuzzyValues.length
    expect(weightedAvg).toBeCloseTo(simpleAvg)
  })
})
