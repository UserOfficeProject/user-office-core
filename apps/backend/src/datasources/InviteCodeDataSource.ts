import { InviteCode } from '../models/InviteCode';
import { UpdateInviteInput } from '../resolvers/mutations/UpdateInviteMutation';

export interface InviteCodeDataSource {
  create(
    createdByUserId: number,
    code: string,
    email: string
  ): Promise<InviteCode>;

  findByCode(code: string): Promise<InviteCode | null>;
  findById(id: number): Promise<InviteCode | null>;

  update(
    args: UpdateInviteInput &
      Partial<Pick<InviteCode, 'claimedAt' | 'claimedByUserId'>>
  ): Promise<InviteCode>;
}
