export interface FuzzyNumber {
  a: number;
  b: number;
  c: number;
}

export class FuzzyMappingService {
  private readonly linguisticTerms: Record<string, FuzzyNumber> = {
    'very-low': { a: 0, b: 0, c: 0.2 },
    'low': { a: 0, b: 0.2, c: 0.4 },
    'medium-low': { a: 0.2, b: 0.4, c: 0.6 },
    'medium': { a: 0.4, b: 0.5, c: 0.6 },
    'medium-high': { a: 0.4, b: 0.6, c: 0.8 },
    'high': { a: 0.6, b: 0.8, c: 1.0 },
    'very-high': { a: 0.8, b: 1.0, c: 1.0 }
  };

  mapLinguisticToFuzzy(term: string): number {
    const fuzzyNumber = this.linguisticTerms[term.toLowerCase()];
    if (!fuzzyNumber) {
      throw new Error(`Unknown linguistic term: ${term}`);
    }
    return this.defuzzify(fuzzyNumber);
  }

  private defuzzify(triangular: FuzzyNumber): number {
    return (triangular.a + triangular.b + triangular.c) / 3;
  }

  getAvailableTerms(): string[] {
    return Object.keys(this.linguisticTerms);
  }
}
