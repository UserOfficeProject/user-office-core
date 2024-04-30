import { User } from './User';

export class UserLinkResponse {
  constructor(public user: User, public link: string) {}
}
