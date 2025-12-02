export interface Evaluation {
  id: string;
  projectId: string;
  criterionId: string;
  linguisticTerm: string;
  fuzzyValue: number;
  label: string;
  alpha: number;
  createdAt: Date;
  updatedAt: Date;
}
