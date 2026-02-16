import { ValidUserInfo } from '@user-office-software/openid/lib/model/ValidUserInfo';
import { injectable } from 'tsyringe';

import { OAuthAuthorization } from './OAuthAuthorization';

@injectable()
export class ELIUserAuthorization extends OAuthAuthorization {
  protected getUniqueId(user: ValidUserInfo) {
    return user.unique_id as string;
  }
}
