import { InviteCode } from '../models/InviteCode';

export interface InviteCodeDataSource {
  create(
    createdByUserId: number,
    code: string,
    email: string
  ): Promise<InviteCode>;

  findByCode(code: string): Promise<InviteCode | null>;
}
