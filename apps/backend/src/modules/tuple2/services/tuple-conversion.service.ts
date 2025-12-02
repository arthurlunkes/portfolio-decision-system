import { FuzzyMappingService } from '../../fuzzy/services/fuzzy-mapping.service.js';

export interface Tuple2D {
  label: string;
  alpha: number;
}

export class TupleConversionService {
  private fuzzyService: FuzzyMappingService;

  constructor() {
    this.fuzzyService = new FuzzyMappingService();
  }

  convertFuzzyTo2Tuple(fuzzyValue: number): Tuple2D {
    const linguisticTerms = this.fuzzyService.getAvailableTerms();
    const roundings = linguisticTerms.map(term => ({
      term,
      value: this.fuzzyService.mapLinguisticToFuzzy(term),
      distance: Math.abs(fuzzyValue - this.fuzzyService.mapLinguisticToFuzzy(term))
    }));

    const closest = roundings.reduce((prev, curr) => 
      curr.distance < prev.distance ? curr : prev
    );

    const alpha = fuzzyValue - closest.value;

    return {
      label: closest.term,
      alpha: Math.round(alpha * 1000) / 1000
    };
  }

  convert2TupleToFuzzy(tuple: Tuple2D): number {
    const baseValue = this.fuzzyService.mapLinguisticToFuzzy(tuple.label);
    return baseValue + tuple.alpha;
  }
}
