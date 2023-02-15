import { RedeemCode } from '../models/RedeemCode';

export interface RedeemCodesDataSource {
  // Create
  createRedeemCode(
    placeholderUserId: number,
    createdByUserId: number,
    code: string
  ): Promise<RedeemCode>;

  // Read
  getRedeemCodes(filter: {
    code?: string;
    placeholder_user_id?: number;
  }): Promise<RedeemCode[]>;

  // update
  updateRedeemCode(code: Partial<RedeemCode>): Promise<RedeemCode>;
}
