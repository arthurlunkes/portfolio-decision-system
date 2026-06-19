export interface FuzzyNumber {
  a: number;
  b: number;
  c: number;
}

// 7-term linguistic scale as defined in the 2-Tuple model (s0–s6)
// EB=0, MB=1, B=2, M=3, A=4, MA=5, EA=6 mapped to [0, 1/6, 2/6, 3/6, 4/6, 5/6, 1]
const SCALE_SIZE = 7;

export const LINGUISTIC_SCALE: Record<string, number> = {
  'EB': 0,
  'MB': 1,
  'B':  2,
  'M':  3,
  'A':  4,
  'MA': 5,
  'EA': 6,
};

export const LINGUISTIC_LABELS: string[] = ['EB', 'MB', 'B', 'M', 'A', 'MA', 'EA'];

export class FuzzyMappingService {
  /** Convert a linguistic label (MB–MA) to its normalised scalar value in [0,1]. */
  mapLinguisticToFuzzy(term: string): number {
    const upper = term.toUpperCase();
    if (!(upper in LINGUISTIC_SCALE)) {
      throw new Error(`Unknown linguistic term: ${term}. Valid terms: EB, MB, B, M, A, MA, EA`);
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
