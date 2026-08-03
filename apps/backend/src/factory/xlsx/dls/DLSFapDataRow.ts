import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { ProposalDataSource } from '../../../datasources/ProposalDataSource';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { CallRowObj } from '../callFaps';
import { RowObj } from '../fap';
import { FapDataRowInput, getDataRow } from '../FapDataRow';

type DLSFapRowObj = RowObj & {
  instrumentRequestedTime: number | null | undefined;
};

function nullFieldHelper(
  data: string | number | null | undefined
): string | number {
  return data ?? '<missing>';
}

export async function getDLSDataRow(
  input: FapDataRowInput
): Promise<DLSFapRowObj> {
  const { proposalPk, proposerId, instrumentId } = input;
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const pi = proposerId
    ? await userDataSource.getBasicUserInfo(proposerId)
    : null;

  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );
  const instrumentRequestedTime = await proposalDataSource.getRequestedTime(
    proposalPk,
    instrumentId
  );

  return {
    ...getDataRow(input),
    piOrg: pi?.institution,
    instrumentRequestedTime,
  };
}

export function populateDLSRow(row: DLSFapRowObj): (string | number)[] {
  return [
    nullFieldHelper(row.propShortCode),
    nullFieldHelper(row.propTitle),
    nullFieldHelper(row.principalInv),
    nullFieldHelper(row.piOrg),
    nullFieldHelper(row.instrName),
    nullFieldHelper(row.instrAvailTime),
    nullFieldHelper(row.techReviewTimeAllocation),
    nullFieldHelper(row.fapTimeAllocation),
    nullFieldHelper(row.propReviewAvgScore),
    nullFieldHelper(row.propFapRankOrder),
    nullFieldHelper(row.inAvailZone),
  ];
}

export function callFapDLSPopulateRow(
  row: CallRowObj & DLSFapRowObj
): (string | number)[] {
  return [
    ...populateDLSRow(row),
    nullFieldHelper(row.fapMeetingDecision),
    nullFieldHelper(row.fapMeetingExComment),
    nullFieldHelper(row.fapMeetingInComment),
    nullFieldHelper(row.instrumentRequestedTime),
  ].concat(row.reviews ? row.reviews.flatMap((review) => review) : []);
}
