import { UserRole } from './User';

export class EmailInviteResponse {
  constructor(
    public userId: number,
    public inviterId: number,
    public role: UserRole
  ) {}
}
