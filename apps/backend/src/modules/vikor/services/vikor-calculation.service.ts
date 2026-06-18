import { CriterionType } from '../../criteria/entities/criterion.entity.js';

export interface VIKORResult {
  projectId: string;
  sValue: number;
  rValue: number;
  qValue: number;
  rank: number;
  /** C1: Q advantage — Q[2nd] - Q[1st] >= 1/(J-1) */
  c1Satisfied: boolean;
  /** C2: Stability — the Q-winner is also the S-winner or the R-winner */
  c2Satisfied: boolean;
}

interface BestWorstValues {
  fStar: number[];
  fMinus: number[];
}

export class VIKORCalculationService {
  calculateVIKOR(
    decisionMatrix: number[][],
    weights: number[],
    criterionTypes: CriterionType[]
  ): VIKORResult[] {
    if (decisionMatrix.length === 0) return [];
    if (decisionMatrix[0].length === 0) return [];

    const numCriteria = decisionMatrix[0].length;

    for (const row of decisionMatrix) {
      if (row.length !== numCriteria) {
        throw new Error('Decision matrix rows must have the same number of criteria');
      }
    }
    if (weights.length !== numCriteria) {
      throw new Error('Number of weights must match number of criteria');
    }
    if (criterionTypes.length !== numCriteria) {
      throw new Error('Number of criterion types must match number of criteria');
    }

    const { fStar, fMinus } = this.determineBestWorst(decisionMatrix, criterionTypes);
    const sValues = this.calculateS(decisionMatrix, weights, fStar, fMinus);
    const rValues = this.calculateR(decisionMatrix, weights, fStar, fMinus);
    const qValues = this.calculateQ(sValues, rValues);

    return this.rankAlternatives(sValues, rValues, qValues);
  }

  private determineBestWorst(
    decisionMatrix: number[][],
    criterionTypes: CriterionType[]
  ): BestWorstValues {
    const numCriteria = decisionMatrix[0].length;
    const fStar: number[] = [];
    const fMinus: number[] = [];

    for (let j = 0; j < numCriteria; j++) {
      const column = decisionMatrix.map(row => row[j]);
      if (criterionTypes[j] === CriterionType.BENEFIT) {
        fStar[j] = Math.max(...column);
        fMinus[j] = Math.min(...column);
      } else {
        fStar[j] = Math.min(...column);
        fMinus[j] = Math.max(...column);
      }
    }

    return { fStar, fMinus };
  }

  private calculateS(
    decisionMatrix: number[][],
    weights: number[],
    fStar: number[],
    fMinus: number[]
  ): number[] {
    return decisionMatrix.map(row => {
      let sum = 0;
      for (let j = 0; j < weights.length; j++) {
        const normalizedDiff = this.safeNormalize(
          Math.abs(fStar[j] - row[j]),
          Math.abs(fStar[j] - fMinus[j])
        );
        sum += weights[j] * normalizedDiff;
      }
      return this.toFinite(sum);
    });
  }

  private calculateR(
    decisionMatrix: number[][],
    weights: number[],
    fStar: number[],
    fMinus: number[]
  ): number[] {
    return decisionMatrix.map(row => {
      const weightedDiffs = weights.map((w, j) => {
        const normalizedDiff = this.safeNormalize(
          Math.abs(fStar[j] - row[j]),
          Math.abs(fStar[j] - fMinus[j])
        );
        return w * normalizedDiff;
      });
      return this.toFinite(Math.max(...weightedDiffs));
    });
  }

  private calculateQ(sValues: number[], rValues: number[]): number[] {
    const sStar = Math.min(...sValues);
    const sMinus = Math.max(...sValues);
    const rStar = Math.min(...rValues);
    const rMinus = Math.max(...rValues);

    const v = 0.5;
    return sValues.map((s, i) => {
      const sTerm = this.safeNormalize(s - sStar, sMinus - sStar);
      const rTerm = this.safeNormalize(rValues[i] - rStar, rMinus - rStar);
      return this.toFinite(v * sTerm + (1 - v) * rTerm);
    });
  }

  private rankAlternatives(
    sValues: number[],
    rValues: number[],
    qValues: number[]
  ): VIKORResult[] {
    const J = qValues.length;

    // Sorted indices by Q ascending
    const qRanked = qValues
      .map((q, i) => ({ q, i }))
      .sort((a, b) => a.q - b.q)
      .map(x => x.i);

    // Sorted indices by S and R ascending (for C2)
    const sRanked = sValues
      .map((s, i) => ({ s, i }))
      .sort((a, b) => a.s - b.s)
      .map(x => x.i);

    const rRanked = rValues
      .map((r, i) => ({ r, i }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.i);

    // C1: Q[2nd] - Q[1st] >= 1/(J-1)  — applies to the winner only
    const c1Threshold = J > 1 ? 1 / (J - 1) : Infinity;
    const c1Satisfied = J < 2 || (qValues[qRanked[1]] - qValues[qRanked[0]] >= c1Threshold);

    // C2: Q-winner is also S-winner or R-winner
    const qWinner = qRanked[0];
    const c2Satisfied = sRanked[0] === qWinner || rRanked[0] === qWinner;

    // Build result list ordered by Q rank
    return qRanked.map((originalIdx, rank) => ({
      projectId: `project-${originalIdx}`,
      sValue: sValues[originalIdx],
      rValue: rValues[originalIdx],
      qValue: qValues[originalIdx],
      rank: rank + 1,
      c1Satisfied,
      c2Satisfied,
    }));
  }

  private safeNormalize(numerator: number, denominator: number): number {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
      return 0;
    }
    return numerator / denominator;
  }

  private toFinite(value: number): number {
    return Number.isFinite(value) ? value : 0;
  }
}
