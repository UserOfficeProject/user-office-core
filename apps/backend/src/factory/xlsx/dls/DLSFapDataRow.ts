import { container } from 'tsyringe';

import { Tokens } from '../../../config/Tokens';
import { UserDataSource } from '../../../datasources/UserDataSource';
import { CallRowObj } from '../callFaps';
import { RowObj } from '../fap';
import { getDataRow } from '../FapDataRow';

type DLSFapRowObj = RowObj & {
  //piInstitution: string | null | undefined;
};

function nullFieldHelper(
  data: string | number | null | undefined
): string | number {
  return data ?? '<missing>';
}

export async function getDLSDataRow(
  proposalPk: number,
  piName: string,
  proposalAverageScore: number,
  instrumentName: string,
  instrumentAvailabilityTime: number,
  fapTimeAllocation: number | null,
  proposalTitle: string,
  proposalId: number | null,
  techReviewTimeAllocation: number | null,
  technicalReviewComment: string | null,
  propFapRankOrder: number | null,
  proposerId: number | null
): Promise<DLSFapRowObj> {
  const userDataSource = container.resolve<UserDataSource>(
    Tokens.UserDataSource
  );
  const pi = proposerId
    ? await userDataSource.getBasicUserInfo(proposerId)
    : null;

  return {
    ...getDataRow(
      proposalPk,
      piName,
      proposalAverageScore,
      instrumentName,
      instrumentAvailabilityTime,
      fapTimeAllocation,
      proposalTitle,
      proposalId,
      techReviewTimeAllocation,
      technicalReviewComment,
      propFapRankOrder
    ),
    piOrg: pi?.institution,
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
    nullFieldHelper(row.fapTimeAllocation ?? row.techReviewTimeAllocation),
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
    row.fapTimeAllocation ?? row.timeRequested ?? '<missing>',
    row.fapMeetingDecision ?? '<missing>',
    row.fapMeetingInComment ?? '<missing>',
    row.fapMeetingExComment ?? '<missing>',
  ].concat(row.reviews ? row.reviews.flatMap((review) => review) : []);
}
