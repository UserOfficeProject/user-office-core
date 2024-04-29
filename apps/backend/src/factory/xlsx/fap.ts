import { groupBy } from 'lodash';
import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { Review } from '../../models/Review';
import { UserWithRole } from '../../models/User';
import { getDataRow } from './FapDataRow';
import { getStfcDataRow } from './stfc/StfcFapDataRow';

type FapXLSXData = Array<{
  sheetName: string;
  rows: Array<Array<string | number>>;
}>;

export type RowObj = {
  propShortCode?: string;
  propTitle?: string;
  principalInv: string;
  instrName?: string;
  instrAvailTime?: number;
  techReviewTimeAllocation?: number | null;
  fapTimeAllocation: number | null;
  propReviewAvgScore?: number;
  propFapRankOrder: number | null;
  inAvailZone?: string | null;
  feedback?: string;
  daysRequested?: number;
  reviews?: Review[] | null;
  piCountry?: string | null;
};

const fapDataRow = container.resolve<typeof getDataRow | typeof getStfcDataRow>(
  Tokens.FapDataRow
);

const populateRow = container.resolve<(row: RowObj) => (string | number)[]>(
  Tokens.PopulateRow
);

const fapDataSource: FapDataSource = container.resolve(Tokens.FapDataSource);

const sortByRankOrder = (a: RowObj, b: RowObj) => {
  if (a.propFapRankOrder === b.propFapRankOrder) {
    return -1;
  } else if (a.propFapRankOrder === null) {
    return 1;
  } else if (b.propFapRankOrder === null) {
    return -1;
  } else {
    return a.propFapRankOrder > b.propFapRankOrder ? 1 : -1;
  }
};

const sortByRankOrAverageScore = (data: RowObj[]) => {
  let allocationTimeSum = 0;

  return data
    .sort((a, b) =>
      (a.propReviewAvgScore || 0) > (b.propReviewAvgScore || 0) ? 1 : -1
    )
    .sort(sortByRankOrder)
    .map((row) => {
      const proposalAllocationTime =
        row.fapTimeAllocation !== null
          ? row.fapTimeAllocation
          : row.techReviewTimeAllocation || 0;

      const isInAvailabilityZone =
        allocationTimeSum + proposalAllocationTime <= (row.instrAvailTime || 0);
      allocationTimeSum = allocationTimeSum + proposalAllocationTime;

      row.inAvailZone = isInAvailabilityZone ? 'yes' : 'no';

      return row;
    });
};

export const collectFapXLSXData = async (
  fapId: number,
  callId: number,
  user: UserWithRole
): Promise<{ data: FapXLSXData; filename: string }> => {
  const fap = await baseContext.queries.fap.get(user, fapId);
  const call = await baseContext.queries.call.get(user, callId);
  // TODO: decide on filename
  const filename = `Fap-${fap?.code}-${call?.shortCode}.xlsx`;

  const instruments =
    await baseContext.queries.instrument.getInstrumentsByFapId(user, {
      fapId,
      callId,
    });

  if (!instruments) {
    throw new Error(
      `Fap with ID '${fapId}'/Call with ID '${callId}' not found, or the user has insufficient rights`
    );
  }

  const baseData = await fapDataSource.getFapReviewData(callId, fapId);

  const instrumentData = groupBy(baseData, 'instrument_id');

  const out: FapXLSXData = [];

  for (const instrument in instrumentData) {
    const records = instrumentData[instrument];

    const sheetName = records[0].instrument_name;

    const rows = await Promise.all(
      records.map(async (proposal) => {
        const pi = await baseContext.queries.user.getBasic(
          user,
          proposal.proposer_id
        );

        const proposalAnswers =
          await baseContext.queries.questionary.getQuestionarySteps(
            user,
            proposal.questionary_id
          );

        const reviews = await baseContext.queries.review.reviewsForProposal(
          user,
          proposal.proposal_pk
        );

        return fapDataRow(
          `${pi?.firstname} ${pi?.lastname}`,
          proposal.average_grade,
          proposal.instrument_name,
          proposal.availability_time,
          proposal.fap_time_allocation,
          proposal.title,
          proposal.proposal_id,
          proposal.time_allocation,
          proposal.rank_order,
          proposal.proposer_id,
          proposalAnswers,
          reviews
        );
      })
    );

    out.push({
      sheetName:
        // Sheet names can't exceed 31 characters
        // use the short code and cut everything after 30 chars
        sheetName.substring(0, 30),
      rows: sortByRankOrAverageScore(rows).map((row) => populateRow(row)),
    });
  }

  return {
    data: out,
    filename: filename.replace(/\s+/g, '_'),
  };
};
