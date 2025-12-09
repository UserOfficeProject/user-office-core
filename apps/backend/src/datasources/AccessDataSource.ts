export interface AccessDataSource {
  canAccess(id: number, action: string, subject: string): Promise<boolean>
}