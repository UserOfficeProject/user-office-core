import { User } from './User';

export class ResetPasswordResponse {
  constructor(public user: User, public link: string) {}
}
