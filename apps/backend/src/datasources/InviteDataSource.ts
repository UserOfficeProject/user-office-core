import { Invite } from '../models/Invite';
import { UpdateInviteInput } from '../resolvers/mutations/UpdateInviteMutation';

export interface InviteDataSource {
  create(createdByUserId: number, code: string, email: string): Promise<Invite>;

  findByCode(code: string): Promise<Invite | null>;
  findById(id: number): Promise<Invite | null>;

  update(
    args: UpdateInviteInput &
      Partial<Pick<Invite, 'claimedAt' | 'claimedByUserId'>>
  ): Promise<Invite>;

  delete(id: number): Promise<void>;
}
