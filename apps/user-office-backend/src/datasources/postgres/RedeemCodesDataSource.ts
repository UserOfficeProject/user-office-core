/* eslint-disable @typescript-eslint/naming-convention */

import { RedeemCode } from '../../models/RedeemCode';
import { RedeemCodesDataSource } from '../RedeemCodes';
import database from './database';
import { createRedeemCodeObject, RedeemCodeRecord } from './records';

export default class PostgresRedeemCodesDataSource
  implements RedeemCodesDataSource
{
  async getRedeemCodes(filter: {
    code?: string;
    placeholderUserId?: number;
  }): Promise<RedeemCode[]> {
    return database
      .select()
      .from('redeem_codes')
      .modify((queryBuilder) => {
        if (filter.placeholderUserId) {
          queryBuilder.where('placeholder_user_id', filter.placeholderUserId);
        }
        if (filter.code) {
          queryBuilder.where('code', filter.code);
        }
      })
      .then((codes: RedeemCodeRecord[]) => codes.map(createRedeemCodeObject));
  }

  async updateRedeemCode(
    redeemCode: Partial<RedeemCode> & Pick<RedeemCode, 'code'>
  ): Promise<RedeemCode> {
    return database('redeem_codes')
      .update({
        code: redeemCode.code,
        placeholderUserId: redeemCode.placeholderUserId,
        createdBy: redeemCode.createdBy,
        createdAt: redeemCode.createdAt,
        claimed_at: redeemCode.claimedAt,
        claimed_by: redeemCode.claimedBy,
      })
      .where({ code: redeemCode.code })
      .returning('*')
      .then((codes: RedeemCodeRecord[]) => createRedeemCodeObject(codes[0]));
  }

  async createRedeemCode(
    placeholderUserId: number,
    createdByUserId: number,
    code: string
  ): Promise<RedeemCode> {
    return database('redeem_codes')
      .insert({
        placeholder_user_id: placeholderUserId,
        created_by: createdByUserId,
        code: code,
      })
      .returning('*')
      .then((codes: RedeemCodeRecord[]) => createRedeemCodeObject(codes[0]));
  }
}
