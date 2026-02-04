export interface CasbinCondition {
  id: number;
  condition: string;
}

export interface CasbinConditionDataSource {
  create(condition: string): Promise<CasbinCondition>;
  get(id: number): Promise<CasbinCondition | null>;
}
