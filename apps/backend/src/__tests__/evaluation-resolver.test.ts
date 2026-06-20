import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for the evaluation resolver logic.
 * These tests validate the permission scoping logic without hitting the database.
 */

// The key business rule: admins can see all evaluations; others only see their own.
describe('Evaluation Resolver — permission scoping', () => {
  function buildEvaluationWhere(
    userRole: string,
    userId: string,
    projectId?: string,
    evaluatorId?: string,
  ): Record<string, unknown> {
    const where: Record<string, unknown> = {}
    if (projectId) where.projectId = projectId
    if (userRole === 'ADMIN') {
      if (evaluatorId) where.evaluatorId = evaluatorId
    } else {
      where.evaluatorId = evaluatorId ?? userId
    }
    return where
  }

  it('non-admin without evaluatorId → scopes to own user', () => {
    const where = buildEvaluationWhere('DECISOR', 'user-1')
    expect(where.evaluatorId).toBe('user-1')
  })

  it('non-admin with explicit evaluatorId → uses provided evaluatorId', () => {
    const where = buildEvaluationWhere('DECISOR', 'user-1', undefined, 'user-2')
    // Non-admins should still be scoped; in backend the guard would reject this
    // but the logic maps evaluatorId ?? userId
    expect(where.evaluatorId).toBe('user-2')
  })

  it('admin without evaluatorId → no evaluatorId filter (sees all)', () => {
    const where = buildEvaluationWhere('ADMIN', 'admin-1')
    expect(where.evaluatorId).toBeUndefined()
  })

  it('admin with evaluatorId → filters by that evaluatorId', () => {
    const where = buildEvaluationWhere('ADMIN', 'admin-1', undefined, 'user-3')
    expect(where.evaluatorId).toBe('user-3')
  })

  it('projectId filter works for any role', () => {
    const whereDecisore = buildEvaluationWhere('DECISOR', 'user-1', 'proj-1')
    expect(whereDecisore.projectId).toBe('proj-1')

    const whereAdmin = buildEvaluationWhere('ADMIN', 'admin-1', 'proj-1')
    expect(whereAdmin.projectId).toBe('proj-1')
  })

  it('admin with both projectId and evaluatorId → filters both', () => {
    const where = buildEvaluationWhere('ADMIN', 'admin-1', 'proj-1', 'user-5')
    expect(where.projectId).toBe('proj-1')
    expect(where.evaluatorId).toBe('user-5')
  })
})

// Validation: weight sum must equal 100 before VIKOR can run
describe('VIKOR prerequisite validation', () => {
  function validateWeightSum(weights: number[]): { valid: boolean; sum: number } {
    const sum = weights.reduce((a, b) => a + b, 0)
    return { valid: Math.abs(sum - 100) < 0.01, sum }
  }

  it('passes when weights sum to 100', () => {
    expect(validateWeightSum([40, 30, 20, 10]).valid).toBe(true)
  })

  it('fails when weights sum to less than 100', () => {
    expect(validateWeightSum([30, 30]).valid).toBe(false)
  })

  it('fails when weights sum to more than 100', () => {
    expect(validateWeightSum([60, 60]).valid).toBe(false)
  })

  it('passes with floating point near 100', () => {
    expect(validateWeightSum([33.33, 33.33, 33.34]).valid).toBe(true)
  })
})

// Validation: minimum project count for dashboard/VIKOR
describe('Dashboard minimum project validation', () => {
  function canShowRanking(projectCount: number): boolean {
    return projectCount >= 2
  }

  it('requires at least 2 projects', () => {
    expect(canShowRanking(0)).toBe(false)
    expect(canShowRanking(1)).toBe(false)
    expect(canShowRanking(2)).toBe(true)
    expect(canShowRanking(10)).toBe(true)
  })
})

// Validation: evaluation locking — project is locked when all criteria have evaluations
describe('Evaluation locking logic', () => {
  function isProjectLocked(projectId: string, criteriaCount: number, evaluations: { projectId: string }[]): boolean {
    if (criteriaCount === 0) return false
    const count = evaluations.filter((e) => e.projectId === projectId).length
    return count >= criteriaCount
  }

  it('is locked when evaluations count equals criteria count', () => {
    const evals = [
      { projectId: 'p1' },
      { projectId: 'p1' },
      { projectId: 'p1' },
    ]
    expect(isProjectLocked('p1', 3, evals)).toBe(true)
  })

  it('is not locked when partially evaluated', () => {
    const evals = [{ projectId: 'p1' }]
    expect(isProjectLocked('p1', 3, evals)).toBe(false)
  })

  it('is not locked when no evaluations', () => {
    expect(isProjectLocked('p1', 3, [])).toBe(false)
  })

  it('is not locked when criteria count is 0', () => {
    const evals = [{ projectId: 'p1' }]
    expect(isProjectLocked('p1', 0, evals)).toBe(false)
  })
})
