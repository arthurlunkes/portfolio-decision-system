import { CriterionType } from '../../criteria/entities/criterion.entity.js';

export interface VIKORResult {
  projectId: string;
  sValue: number;
  rValue: number;
  qValue: number;
  rank: number;
  isAcceptable: boolean;
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
    const numAlternatives = decisionMatrix.length;
    const numCriteria = decisionMatrix[0].length;

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
    const numAlternatives = decisionMatrix.length;
    const sValues: number[] = [];

    for (let i = 0; i < numAlternatives; i++) {
      let sum = 0;
      for (let j = 0; j < weights.length; j++) {
        const normalizedDiff = Math.abs(fStar[j] - decisionMatrix[i][j]) / Math.abs(fStar[j] - fMinus[j]);
        sum += weights[j] * normalizedDiff;
      }
      sValues[i] = sum;
    }

    return sValues;
  }

  private calculateR(
    decisionMatrix: number[][],
    weights: number[],
    fStar: number[],
    fMinus: number[]
  ): number[] {
    const numAlternatives = decisionMatrix.length;
    const rValues: number[] = [];

    for (let i = 0; i < numAlternatives; i++) {
      const weightedDiffs = [];
      for (let j = 0; j < weights.length; j++) {
        const normalizedDiff = Math.abs(fStar[j] - decisionMatrix[i][j]) / Math.abs(fStar[j] - fMinus[j]);
        weightedDiffs.push(weights[j] * normalizedDiff);
      }
      rValues[i] = Math.max(...weightedDiffs);
    }

    return rValues;
  }

  private calculateQ(sValues: number[], rValues: number[]): number[] {
    const sStar = Math.min(...sValues);
    const sMinus = Math.max(...sValues);
    const rStar = Math.min(...rValues);
    const rMinus = Math.max(...rValues);

    const v = 0.5;
    const qValues: number[] = [];

    for (let i = 0; i < sValues.length; i++) {
      const q = v * ((sValues[i] - sStar) / (sMinus - sStar)) + 
                (1 - v) * ((rValues[i] - rStar) / (rMinus - rStar));
      qValues[i] = q;
    }

    return qValues;
  }

  private rankAlternatives(sValues: number[], rValues: number[], qValues: number[]): VIKORResult[] {
    const results: VIKORResult[] = [];
    
    const sortedIndices = qValues
      .map((q, index) => ({ q, index }))
      .sort((a, b) => a.q - b.q)
      .map(item => item.index);

    for (let i = 0; i < qValues.length; i++) {
      const index = sortedIndices[i];
      const isAcceptable = this.checkAcceptability(qValues, index, sortedIndices);
      
      results.push({
        projectId: `project-${index}`,
        sValue: sValues[index],
        rValue: rValues[index],
        qValue: qValues[index],
        rank: i + 1,
        isAcceptable
      });
    }

    return results;
  }

  private checkAcceptability(qValues: number[], currentIndex: number, sortedIndices: number[]): boolean {
    if (sortedIndices.length < 2) return true;
    
    const firstQ = qValues[sortedIndices[0]];
    const secondQ = qValues[sortedIndices[1]];
    
    const acceptableAdvantage = secondQ - firstQ >= 1 / (sortedIndices.length - 1);
    
    return acceptableAdvantage;
  }
}
