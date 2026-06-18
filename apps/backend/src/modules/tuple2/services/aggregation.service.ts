import { TupleConversionService, type Tuple2D } from './tuple-conversion.service.js';

export interface WeightedTuple {
  index: number;
  alpha: number;
  /** Importance weight of this evaluator (default 1/K for equal weights). */
  weight?: number;
}

export class TupleAggregationService {
  private readonly tupleService: TupleConversionService;

  constructor() {
    this.tupleService = new TupleConversionService();
  }

  /**
   * 2-Tuple weighted average operator.
   * Given K evaluations (s_i^k, α^k) with optional weights w_k (must sum to 1),
   * returns the aggregated 2-tuple (s_i, α).
   *
   * Formula: Δ⁻¹( Σ w_k · Δ(s_i^k, α^k) )
   */
  aggregate(evaluations: WeightedTuple[]): Tuple2D {
    if (evaluations.length === 0) {
      throw new Error('Cannot aggregate an empty list of evaluations');
    }

    const hasCustomWeights = evaluations.some(e => e.weight !== undefined);
    let weights: number[];

    if (hasCustomWeights) {
      weights = evaluations.map(e => e.weight ?? (1 / evaluations.length));
      const total = weights.reduce((s, w) => s + w, 0);
      // normalise in case weights don't sum exactly to 1
      weights = weights.map(w => w / total);
    } else {
      const uniform = 1 / evaluations.length;
      weights = evaluations.map(() => uniform);
    }

    // Σ w_k · Δ(s_i^k, α^k)  — Δ converts to scalar
    const scalarSum = evaluations.reduce((sum, ev, k) => {
      const scalar = this.tupleService.indexAlphaToFuzzy(ev.index, ev.alpha);
      return sum + weights[k] * scalar;
    }, 0);

    // Δ⁻¹: convert scalar back to 2-tuple
    return this.tupleService.convertFuzzyTo2Tuple(scalarSum);
  }

  /**
   * Convenience: aggregate using raw fuzzyValues (scalars) already stored in DB.
   * Produces the same result as aggregate() when α was computed correctly.
   */
  aggregateScalars(fuzzyValues: number[], weights?: number[]): Tuple2D {
    if (fuzzyValues.length === 0) {
      throw new Error('Cannot aggregate an empty list');
    }

    const w = weights ?? fuzzyValues.map(() => 1 / fuzzyValues.length);
    const total = w.reduce((s, v) => s + v, 0);

    const scalarSum = fuzzyValues.reduce(
      (sum, fv, k) => sum + (w[k] / total) * fv,
      0,
    );

    return this.tupleService.convertFuzzyTo2Tuple(scalarSum);
  }
}
