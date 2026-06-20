// Linguistic expertise scale for decissor weighting (λk)
// Maps to numeric values 0-6, used for normalised weight computation.
// Default: IM = 4 (Important) → equal weights when all decisors share same grade.
export const EXPERTISE_SCALE: Record<string, number> = {
  EN: 0, // Extremamente Não importante
  IN: 1, // Indiferente / Nenhuma importância
  PI: 2, // Pouco Importante
  OI: 3, // Mais ou menos importante
  IM: 4, // Importante (default)
  MI: 5, // Muito Importante
  EM: 6, // Extremamente importante
};

export const EXPERTISE_LABELS: string[] = ['EN', 'IN', 'PI', 'OI', 'IM', 'MI', 'EM'];

export const DEFAULT_WEIGHT_LINGUISTIC = 'IM';
export const DEFAULT_WEIGHT_NUMERIC = 4;

export class DecissorWeightService {
  getNumericValue(linguistic: string): number {
    const upper = linguistic.toUpperCase();
    if (!(upper in EXPERTISE_SCALE)) {
      throw new Error(
        `Termo linguístico de expertise desconhecido: "${linguistic}". Válidos: ${EXPERTISE_LABELS.join(', ')}`,
      );
    }
    return EXPERTISE_SCALE[upper];
  }

  getLinguisticLabel(numeric: number): string {
    const idx = Math.round(Math.max(0, Math.min(6, numeric)));
    return EXPERTISE_LABELS[idx];
  }

  getAvailableTerms(): string[] {
    return [...EXPERTISE_LABELS];
  }

  /**
   * Normalise a list of numeric weights so they sum to 1.
   * When all values are 0 (degenerate), falls back to equal weights.
   */
  normalise(numericValues: number[]): number[] {
    const total = numericValues.reduce((s, v) => s + v, 0);
    if (total === 0) {
      const uniform = 1 / numericValues.length;
      return numericValues.map(() => uniform);
    }
    return numericValues.map((v) => v / total);
  }

  /**
   * Given a set of (evaluatorId → weightNumeric) entries for a portfolio,
   * return a map of evaluatorId → normalised λk.
   */
  buildLambdaMap(entries: { evaluatorId: string; weightNumeric: number }[]): Map<string, number> {
    const total = entries.reduce((s, e) => s + e.weightNumeric, 0);
    const map = new Map<string, number>();
    for (const e of entries) {
      map.set(e.evaluatorId, total === 0 ? 1 / entries.length : e.weightNumeric / total);
    }
    return map;
  }
}
