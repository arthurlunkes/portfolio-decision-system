import { EXPERTISE_SCALE } from '../../decissor/services/decissor-weight.service.js';

export interface ImportanceRecord {
  criterionId: string;
  evaluatorId: string;
  numericValue: number;
}

export interface CriterionWeight {
  criterionId: string;
  delta: number;    // Δj = Σ(λk · βkj) — media ponderada das importâncias
  omega: number;    // ωj = Δj / Σ(Δk) — peso normalizado em [0,1]
  omegaPct: number; // ωj × 100 — para exibição
}

export class CriterionWeightService {
  /**
   * Calcula os pesos ωj a partir das avaliações de importância dos decisores.
   *
   * Fórmula (Carniel 2022 / Wu, Xu & Zhong 2015):
   *   Δj  = Σk λk · βkj         (média ponderada pelo grau de expertise do decisor)
   *   ωj  = Δj / Σj(Δj)         (normalização → soma = 1,0000)
   *
   * @param criterionIds  lista ordenada de IDs dos critérios do portfólio
   * @param importances   registros de avaliação de importância (todos os decisores)
   * @param lambdaMap     mapa evaluatorId → λk (pesos dos decisores); undefined = 1/n
   */
  compute(
    criterionIds: string[],
    importances: ImportanceRecord[],
    lambdaMap?: Map<string, number>,
  ): CriterionWeight[] {
    if (criterionIds.length === 0) return [];

    // Obter avaliadores únicos que avaliaram pelo menos um critério
    const evaluatorIds = [...new Set(importances.map((i) => i.evaluatorId))];
    if (evaluatorIds.length === 0) {
      throw new Error(
        'Nenhuma avaliação de importância registrada. ' +
        'Os decisores devem avaliar a importância de cada critério antes de calcular o ranking.',
      );
    }

    const n = evaluatorIds.length;

    // Construir λk: usa lambdaMap se fornecido, senão 1/n
    const getLambda = (evaluatorId: string): number => {
      if (!lambdaMap || lambdaMap.size === 0) return 1 / n;
      return lambdaMap.get(evaluatorId) ?? (1 / n);
    };

    const deltas: CriterionWeight[] = criterionIds.map((criterionId) => {
      const criterionImportances = importances.filter((i) => i.criterionId === criterionId);
      if (criterionImportances.length === 0) {
        throw new Error(
          `Critério "${criterionId}" não tem avaliações de importância. ` +
          'Todos os critérios devem ser avaliados antes de calcular o ranking.',
        );
      }
      const delta = criterionImportances.reduce(
        (sum, imp) => sum + getLambda(imp.evaluatorId) * imp.numericValue,
        0,
      );
      return { criterionId, delta, omega: 0, omegaPct: 0 };
    });

    const totalDelta = deltas.reduce((s, d) => s + d.delta, 0);
    if (totalDelta === 0) {
      // Todos avaliaram EN=0 — distribui igualmente (caso degenerado)
      const uniform = 1 / criterionIds.length;
      return deltas.map((d) => ({ ...d, omega: uniform, omegaPct: uniform * 100 }));
    }

    return deltas.map((d) => ({
      ...d,
      omega: d.delta / totalDelta,
      omegaPct: (d.delta / totalDelta) * 100,
    }));
  }

  /** Valida termo linguístico de importância e retorna valor numérico */
  termToNumeric(term: string): number {
    const upper = term.toUpperCase();
    if (!(upper in EXPERTISE_SCALE)) {
      throw new Error(
        `Termo de importância inválido: "${term}". Válidos: EN, IN, PI, OI, IM, MI, EM`,
      );
    }
    return EXPERTISE_SCALE[upper];
  }
}
