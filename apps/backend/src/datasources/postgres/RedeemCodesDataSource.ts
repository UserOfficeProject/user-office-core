/* eslint-disable @typescript-eslint/naming-convention */

import { RedeemCode } from '../../models/RedeemCode';
import { RedeemCodesDataSource } from '../RedeemCodesDataSource';
import database from './database';
import { createRedeemCodeObject, RedeemCodeRecord } from './records';

export default class PostgresRedeemCodesDataSource
  implements RedeemCodesDataSource
{
  async getRedeemCode(code: string): Promise<RedeemCode> {
    return database
      .select()
      .from('redeem_codes')
      .where({ code })
      .first()
      .then((code: RedeemCodeRecord) => createRedeemCodeObject(code));
  }

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
    await database('redeem_codes')
      .update({
        claimed_at: redeemCode.claimedAt,
        claimed_by: redeemCode.claimedBy,
      })
      .where('code', redeemCode.code);

    return this.getRedeemCode(redeemCode.code);
  }

  generateRandomCode() {
    return Math.random().toString(36).substring(2, 8).toLowerCase();
  }

  async createRedeemCode(
    placeholderUserId: number,
    createdByUserId: number
  ): Promise<RedeemCode> {
    const newCode = this.generateRandomCode();
    const existingCodes = await this.getRedeemCodes({
      code: newCode,
    });

    // in case of collision, try again
    if (existingCodes.length > 0) {
      return this.createRedeemCode(placeholderUserId, createdByUserId);
    }

    return database('redeem_codes')
      .insert({
        placeholder_user_id: placeholderUserId,
        created_by: createdByUserId,
        code: this.generateRandomCode(),
      })
      .returning('*')
      .then((codes: RedeemCodeRecord[]) => createRedeemCodeObject(codes[0]));
  }
}
