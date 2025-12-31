export interface IGuard {
  name: string;
  initialize(proposalPk: number): Promise<void>;
  guard(): boolean;
}
