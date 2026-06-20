import { describe, it, expect } from 'vitest'
import { VIKORCalculationService } from '../modules/vikor/services/vikor-calculation.service.js'
import { CriterionType } from '../modules/criteria/entities/criterion.entity.js'

describe('VIKORCalculationService', () => {
  const service = new VIKORCalculationService()

  describe('calculateVIKOR', () => {
    it('returns empty array for empty matrix', () => {
      expect(service.calculateVIKOR([], [], [])).toEqual([])
    })

    it('ranks 2 projects with 1 benefit criterion correctly', () => {
      // Project A: 0.8 (better), Project B: 0.2 (worse)
      const matrix = [[0.8], [0.2]]
      const weights = [1.0]
      const types = [CriterionType.BENEFIT]

      const results = service.calculateVIKOR(matrix, weights, types)
      expect(results).toHaveLength(2)

      const winner = results.find((r) => r.rank === 1)
      const loser = results.find((r) => r.rank === 2)
      expect(winner?.projectId).toBe('project-0')
      expect(loser?.projectId).toBe('project-1')
    })

    it('ranks 2 projects with 1 cost criterion (lower is better)', () => {
      // Project A: 0.8 (worse cost), Project B: 0.2 (better cost)
      const matrix = [[0.8], [0.2]]
      const weights = [1.0]
      const types = [CriterionType.COST]

      const results = service.calculateVIKOR(matrix, weights, types)
      const winner = results.find((r) => r.rank === 1)
      expect(winner?.projectId).toBe('project-1')
    })

    it('assigns rank 1 to the project with lowest Q value', () => {
      const matrix = [
        [0.9, 0.8],
        [0.3, 0.2],
        [0.6, 0.5],
      ]
      const weights = [0.5, 0.5]
      const types = [CriterionType.BENEFIT, CriterionType.BENEFIT]

      const results = service.calculateVIKOR(matrix, weights, types)
      const winner = results.find((r) => r.rank === 1)
      // Project 0 has highest values (best for benefit), so should win
      expect(winner?.projectId).toBe('project-0')
      expect(winner?.qValue).toBeLessThanOrEqual(results.find((r) => r.rank === 2)!.qValue)
    })

    it('produces Q values in range [0, 1]', () => {
      const matrix = [[1.0, 0.0], [0.5, 0.5], [0.0, 1.0]]
      const weights = [0.5, 0.5]
      const types = [CriterionType.BENEFIT, CriterionType.COST]

      const results = service.calculateVIKOR(matrix, weights, types)
      for (const r of results) {
        expect(r.qValue).toBeGreaterThanOrEqual(0)
        expect(r.qValue).toBeLessThanOrEqual(1)
      }
    })

    it('c1Satisfied is true when Q gap between 1st and 2nd >= 1/(J-1)', () => {
      // Extreme difference: project 0 is clearly best
      const matrix = [[1.0], [0.0], [0.0]]
      const weights = [1.0]
      const types = [CriterionType.BENEFIT]

      const results = service.calculateVIKOR(matrix, weights, types)
      const winner = results.find((r) => r.rank === 1)!
      // With J=3, threshold = 1/2 = 0.5; Q gap should be 0.5
      expect(winner.c1Satisfied).toBe(true)
    })

    it('throws when weights length mismatches criteria', () => {
      expect(() =>
        service.calculateVIKOR([[0.5, 0.3]], [1.0], [CriterionType.BENEFIT]),
      ).toThrow()
    })

    it('throws when criterion types length mismatches criteria', () => {
      expect(() =>
        service.calculateVIKOR([[0.5, 0.3]], [0.5, 0.5], [CriterionType.BENEFIT]),
      ).toThrow()
    })

    it('handles single project gracefully (no ranking competition)', () => {
      const matrix = [[0.5, 0.5]]
      const weights = [0.5, 0.5]
      const types = [CriterionType.BENEFIT, CriterionType.BENEFIT]

      const results = service.calculateVIKOR(matrix, weights, types)
      expect(results).toHaveLength(1)
      expect(results[0].rank).toBe(1)
    })
  })
})
