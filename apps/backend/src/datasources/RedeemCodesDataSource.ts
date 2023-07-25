import { RedeemCode } from '../models/RedeemCode';

export interface RedeemCodesDataSource {
  // Create
  createRedeemCode(
    placeholderUserId: number,
    createdByUserId: number
  ): Promise<RedeemCode>;

  // Read
  getRedeemCodes(filter: {
    code?: string;
    placeholderUserId?: number;
  }): Promise<RedeemCode[]>;

  // update
  updateRedeemCode(code: Partial<RedeemCode>): Promise<RedeemCode>;
}
