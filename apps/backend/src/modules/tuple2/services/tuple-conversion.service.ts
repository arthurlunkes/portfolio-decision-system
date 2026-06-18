import { FuzzyMappingService } from '../../fuzzy/services/fuzzy-mapping.service.js';

export interface Tuple2D {
  /** Integer index of the closest linguistic term (0–4). */
  index: number;
  /** Label of the closest term (MB, B, M, A, MA). */
  label: string;
  /** Correction value α ∈ [−0.5, 0.5). */
  alpha: number;
}

export class TupleConversionService {
  private readonly fuzzyService: FuzzyMappingService;
  private readonly scaleSize: number;

  constructor() {
    this.fuzzyService = new FuzzyMappingService();
    this.scaleSize = this.fuzzyService.getScaleSize();
  }

  /**
   * Δ⁻¹: Convert a normalised scalar value in [0,1] to a 2-tuple (s_i, α).
   * α ∈ [−0.5, 0.5) by construction (round to nearest index).
   */
  convertFuzzyTo2Tuple(fuzzyValue: number): Tuple2D {
    // Map scalar [0,1] → continuous index position [0, g] where g = scaleSize−1
    const g = this.scaleSize - 1;
    const continuous = fuzzyValue * g;
    const index = Math.round(continuous);
    const clampedIndex = Math.max(0, Math.min(g, index));
    const alpha = continuous - clampedIndex;
    const label = this.fuzzyService.getLabelByIndex(clampedIndex);

    return {
      index: clampedIndex,
      label,
      alpha: Math.round(alpha * 1000) / 1000,
    };
  }

  /**
   * Δ: Convert a 2-tuple (s_i, α) back to a normalised scalar in [0,1].
   */
  convert2TupleToFuzzy(tuple: Tuple2D): number {
    const g = this.scaleSize - 1;
    return (tuple.index + tuple.alpha) / g;
  }

  /**
   * Δ: Overload accepting index + alpha directly.
   */
  indexAlphaToFuzzy(index: number, alpha: number): number {
    const g = this.scaleSize - 1;
    return (index + alpha) / g;
  }
}
