import { describe, it, expect } from 'vitest'
import { TupleConversionService } from '../modules/tuple2/services/tuple-conversion.service.js'

describe('TupleConversionService', () => {
  const service = new TupleConversionService()

  describe('convertFuzzyTo2Tuple', () => {
    it('converts 0 → (EB, 0)', () => {
      const t = service.convertFuzzyTo2Tuple(0)
      expect(t.label).toBe('EB')
      expect(t.index).toBe(0)
      expect(t.alpha).toBeCloseTo(0)
    })

    it('converts 1 → (EA, 0)', () => {
      const t = service.convertFuzzyTo2Tuple(1)
      expect(t.label).toBe('EA')
      expect(t.index).toBe(6)
      expect(t.alpha).toBeCloseTo(0)
    })

    it('converts 0.5 → (M, ~0)', () => {
      const t = service.convertFuzzyTo2Tuple(0.5)
      expect(t.label).toBe('M')
      expect(t.alpha).toBeCloseTo(0)
    })

    it('alpha is within [-0.5, 0.5)', () => {
      const values = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1.0]
      for (const v of values) {
        const t = service.convertFuzzyTo2Tuple(v)
        expect(t.alpha).toBeGreaterThanOrEqual(-0.5)
        expect(t.alpha).toBeLessThan(0.5 + 0.01) // small tolerance
      }
    })
  })

  describe('convert2TupleToFuzzy', () => {
    it('round-trips fuzzy → tuple → fuzzy', () => {
      const values = [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1]
      for (const v of values) {
        const tuple = service.convertFuzzyTo2Tuple(v)
        const back = service.convert2TupleToFuzzy(tuple)
        expect(back).toBeCloseTo(v, 3)
      }
    })

    it('(index=3, alpha=0) → 0.5', () => {
      const result = service.convert2TupleToFuzzy({ index: 3, label: 'M', alpha: 0 })
      expect(result).toBeCloseTo(0.5)
    })
  })

  describe('indexAlphaToFuzzy', () => {
    it('(0, 0) → 0', () => {
      expect(service.indexAlphaToFuzzy(0, 0)).toBeCloseTo(0)
    })
    it('(6, 0) → 1', () => {
      expect(service.indexAlphaToFuzzy(6, 0)).toBeCloseTo(1)
    })
    it('(3, 0) → 0.5', () => {
      expect(service.indexAlphaToFuzzy(3, 0)).toBeCloseTo(0.5)
    })
  })
})
