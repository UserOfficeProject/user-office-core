import { InviteCode } from '../../models/InviteCode';
import { UpdateInviteInput } from '../../resolvers/mutations/UpdateInviteMutation';
import InviteCodesDataSource from '../postgres/InviteCodesDataSource';

export class InviteCodesDataSourceMock implements InviteCodesDataSource {
  private inviteCodes: InviteCode[];

  constructor() {
    this.init();
  }

  async findById(id: number): Promise<InviteCode | null> {
    return this.inviteCodes.find((inviteCode) => inviteCode.id === id) || null;
  }

  public init() {
    this.inviteCodes = [
      new InviteCode(
        1,
        'code1',
        'test1@example.com',
        'note1',
        new Date(),
        1,
        null,
        null
      ),
      new InviteCode(
        2,
        'code2',
        'test2@example.com',
        'note2',
        new Date(),
        2,
        null,
        null
      ),
      new InviteCode(
        3,
        'code3',
        'test3@example.com',
        'note3',
        new Date(),
        3,
        new Date(),
        1001
      ),
    ];
  }

  async findByCode(code: string): Promise<InviteCode | null> {
    return (
      this.inviteCodes.find((inviteCode) => inviteCode.code === code) || null
    );
  }

  async create(
    createdByUserId: number,
    code: string,
    email: string
  ): Promise<InviteCode> {
    const newInviteCode = new InviteCode(
      this.inviteCodes.length + 1, // Generate new ID
      code,
      email,
      '', // Default note to an empty string
      new Date(),
      createdByUserId,
      null,
      null
    );

    this.inviteCodes.push(newInviteCode);

    return newInviteCode;
  }

  async update(
    args: UpdateInviteInput & Pick<InviteCode, 'claimedAt' | 'claimedByUserId'>
  ): Promise<InviteCode> {
    const inviteCode = await this.findById(args.id);
    if (!inviteCode) {
      throw new Error('Invite code not found');
    }

    inviteCode.email = args.email || inviteCode.email;
    inviteCode.claimedAt = args.claimedAt || inviteCode.claimedAt;
    inviteCode.claimedByUserId =
      args.claimedByUserId || inviteCode.claimedByUserId;

    return inviteCode;
  }
}
