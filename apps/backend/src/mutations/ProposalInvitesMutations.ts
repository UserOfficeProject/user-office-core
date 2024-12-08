import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { RedeemCodesDataSource } from '../datasources/RedeemCodesDataSource';
import { UserDataSource } from '../datasources/UserDataSource';
import { Authorized } from '../decorators';
import { rejection, Rejection } from '../models/Rejection';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { RedeemCode } from '../resolvers/types/RedeemCode';
import { ApolloServerErrorCodeExtended } from '../utils/utilTypes';

@injectable()
export default class RedeemCodesMutations {
  constructor(
    @inject(Tokens.UserDataSource) private dataSource: UserDataSource,
    @inject(Tokens.RedeemCodesDataSource)
    private redeemCodeDataSource: RedeemCodesDataSource
  ) {}

  @Authorized([Roles.USER])
  async redeemCode(
    user: UserWithRole | null,
    code: string
  ): Promise<RedeemCode | Rejection> {
    const redeemCodes = await this.redeemCodeDataSource.getRedeemCodes({
      code: code.toLowerCase().trim(),
    });
    const redeemCode = redeemCodes[0];
    if (!redeemCode) {
      return rejection('Could not find redeem code', {
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
      });
    }

    if (redeemCode.claimedBy !== null) {
      return rejection('The code is already redeemed', {
        code: ApolloServerErrorCodeExtended.BAD_USER_INPUT,
      });
    }

    const redeemerId = user!.id;
    const placeholderUserId = redeemCode.placeholderUserId;

    const placeholderUser = await this.dataSource.getUser(placeholderUserId);
    if (!placeholderUser || !placeholderUser.placeholder) {
      return rejection('Could not find placeholder user', {
        code: ApolloServerErrorCodeExtended.NOT_FOUND,
        user: placeholderUser,
      });
    }

    await this.dataSource.mergeUsers(placeholderUserId, redeemerId);

    const updatedRedeemCode = await this.redeemCodeDataSource.updateRedeemCode({
      code: redeemCode.code,
      claimedAt: new Date(),
      claimedBy: redeemerId,
    });

    try {
      await this.dataSource.delete(placeholderUserId);
    } catch (err) {
      logger.logException(
        'Could not delete placeholder user after merging with redeemer',
        err,
        { placeholderUserId, redeemerId }
      );
    }

    return updatedRedeemCode;
  }
}
