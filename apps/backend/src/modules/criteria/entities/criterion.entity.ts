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
