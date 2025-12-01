import { Action, Subject } from "./postgres/AccessDataSource";

export interface AccessDataSource {
  canAccess(id: number, action: Action): boolean
}