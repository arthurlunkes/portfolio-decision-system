export interface FuzzyNumber {
  a: number;
  b: number;
  c: number;
}

// 5-term linguistic scale as defined in the 2-Tuple model (s0–s4)
// MB=0, B=1, M=2, A=3, MA=4 mapped to [0, 0.25, 0.5, 0.75, 1.0]
const SCALE_SIZE = 5;

export const LINGUISTIC_SCALE: Record<string, number> = {
  'MB': 0,
  'B':  1,
  'M':  2,
  'A':  3,
  'MA': 4,
};

export const LINGUISTIC_LABELS: string[] = ['MB', 'B', 'M', 'A', 'MA'];

export class FuzzyMappingService {
  /** Convert a linguistic label (MB–MA) to its normalised scalar value in [0,1]. */
  mapLinguisticToFuzzy(term: string): number {
    const upper = term.toUpperCase();
    if (!(upper in LINGUISTIC_SCALE)) {
      throw new Error(`Unknown linguistic term: ${term}. Valid terms: MB, B, M, A, MA`);
    }
    return LINGUISTIC_SCALE[upper] / (SCALE_SIZE - 1);
  }

  /** Return the integer index (0–4) for a given label. */
  getIndex(term: string): number {
    const upper = term.toUpperCase();
    if (!(upper in LINGUISTIC_SCALE)) {
      throw new Error(`Unknown linguistic term: ${term}`);
    }
    return LINGUISTIC_SCALE[upper];
  }

  /** Return the label for a given index. */
  getLabelByIndex(index: number): string {
    if (index < 0 || index >= SCALE_SIZE) {
      throw new Error(`Index out of range: ${index}`);
    }
    return LINGUISTIC_LABELS[index];
  }

  getAvailableTerms(): string[] {
    return [...LINGUISTIC_LABELS];
  }

  getScaleSize(): number {
    return SCALE_SIZE;
  }
}
