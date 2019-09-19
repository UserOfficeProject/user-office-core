export interface AdminDataSource {
  get(id: number): Promise<string | null>;
  setPageText(id: number, text: string): Promise<Boolean>;
}
