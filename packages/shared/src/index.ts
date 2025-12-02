export enum CriterionType {
  BENEFIT = 'BENEFIT',
  COST = 'COST'
}

export interface Criterion {
  id: string;
  name: string;
  description: string;
  weight: number;
  type: CriterionType;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

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
