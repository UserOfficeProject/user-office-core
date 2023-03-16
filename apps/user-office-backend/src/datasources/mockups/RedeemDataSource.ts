import { RedeemCode } from '../../models/RedeemCode';
import { RedeemCodesDataSource } from '../RedeemCodesDataSource';
import { dummyPlaceHolderUser, dummyUser } from './UserDataSource';

export const VALID_REDEEM_CODE = 'valid_redeem_code';
export const NEW_REDEEM_CODE = 'new_redeem_code';

const dummyRedeemCodes: RedeemCode[] = [
  {
    code: VALID_REDEEM_CODE,
    placeholderUserId: dummyPlaceHolderUser.id,
    createdBy: dummyUser.id,
    createdAt: new Date(),
    claimedBy: null,
    claimedAt: null,
  },
];

export class RedeemDataSourceMock implements RedeemCodesDataSource {
  async createRedeemCode(
    placeholderUserId: number,
    createdByUserId: number
  ): Promise<RedeemCode> {
    const newRedeemCode = {
      code: NEW_REDEEM_CODE,
      placeholderUserId,
      createdBy: createdByUserId,
      createdAt: new Date(),
      claimedBy: null,
      claimedAt: null,
    };

    dummyRedeemCodes.push(newRedeemCode);

    return newRedeemCode;
  }
  async getRedeemCodes(filter: { code?: string; placeholderUserId?: number }) {
    return dummyRedeemCodes.filter((c) => {
      if (
        (filter.code && c.code !== filter.code) ||
        (filter.placeholderUserId &&
          c.placeholderUserId !== filter.placeholderUserId)
      ) {
        return false;
      } else {
        return true;
      }
    });
  }

  async updateRedeemCode(code: Partial<RedeemCode>): Promise<RedeemCode> {
    const redeemCode = dummyRedeemCodes.find((c) => c.code === code.code);

    if (!redeemCode) {
      throw new Error('Could not find redeem code');
    }

    const updatedRedeemCode = {
      ...redeemCode,
      ...code,
    };

    return updatedRedeemCode;
  }
}
