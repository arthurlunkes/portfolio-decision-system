import { describe, it, expect } from 'vitest'
import { FuzzyMappingService } from '../modules/fuzzy/services/fuzzy-mapping.service.js'

describe('FuzzyMappingService', () => {
  const service = new FuzzyMappingService()

  describe('mapLinguisticToFuzzy', () => {
    it('maps EB to 0', () => {
      expect(service.mapLinguisticToFuzzy('EB')).toBe(0)
    })

    it('maps EA to 1', () => {
      expect(service.mapLinguisticToFuzzy('EA')).toBe(1)
    })

    it('maps M to 0.5', () => {
      expect(service.mapLinguisticToFuzzy('M')).toBeCloseTo(0.5)
    })

    it('maps MB to ~0.167', () => {
      expect(service.mapLinguisticToFuzzy('MB')).toBeCloseTo(1 / 6)
    })

    it('maps B to ~0.333', () => {
      expect(service.mapLinguisticToFuzzy('B')).toBeCloseTo(2 / 6)
    })

    it('maps A to ~0.667', () => {
      expect(service.mapLinguisticToFuzzy('A')).toBeCloseTo(4 / 6)
    })

    it('maps MA to ~0.833', () => {
      expect(service.mapLinguisticToFuzzy('MA')).toBeCloseTo(5 / 6)
    })

    it('is case-insensitive', () => {
      expect(service.mapLinguisticToFuzzy('eb')).toBe(0)
      expect(service.mapLinguisticToFuzzy('ea')).toBe(1)
    })

    it('throws on unknown term', () => {
      expect(() => service.mapLinguisticToFuzzy('XYZ')).toThrow('Unknown linguistic term')
    })
  })

  describe('getIndex', () => {
    it('returns 0 for EB', () => {
      expect(service.getIndex('EB')).toBe(0)
    })
    it('returns 6 for EA', () => {
      expect(service.getIndex('EA')).toBe(6)
    })
    it('returns 3 for M', () => {
      expect(service.getIndex('M')).toBe(3)
    })
    it('throws on invalid term', () => {
      expect(() => service.getIndex('ZZZ')).toThrow()
    })
  })

  describe('getLabelByIndex', () => {
    it('returns EB for index 0', () => {
      expect(service.getLabelByIndex(0)).toBe('EB')
    })
    it('returns EA for index 6', () => {
      expect(service.getLabelByIndex(6)).toBe('EA')
    })
    it('throws for out-of-range index', () => {
      expect(() => service.getLabelByIndex(-1)).toThrow()
      expect(() => service.getLabelByIndex(7)).toThrow()
    })
  })

  describe('getAvailableTerms', () => {
    it('returns all 7 terms', () => {
      const terms = service.getAvailableTerms()
      expect(terms).toHaveLength(7)
      expect(terms).toContain('EB')
      expect(terms).toContain('EA')
    })
  })
})
