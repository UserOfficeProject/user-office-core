import { groupBy } from 'lodash';
import { DateTime } from 'luxon';
import { container } from 'tsyringe';

import { collectCallFapXLSXData } from './callFaps';
import { buildReviewRow, FapDataRow, FapDataRowInput } from './FapDataRow';
import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { UserWithRole } from '../../models/User';
import { stripHtml } from '../../utils/stringStripHtml';

type FapXLSXData = Array<{
  sheetName: string;
  rows: Array<Array<string | number>>;
}>;

export type RowObj = {
  proposalPk: number;
  propShortCode?: string;
  propTitle?: string;
  principalInv: string;
  instrName?: string;
  instrAvailTime: number | null;
  techReviewTimeAllocation?: number | null;
  techReviewComment: string | null;
  fapTimeAllocation: number | null;
  propReviewAvgScore?: number;
  propFapRankOrder: number | null;
  inAvailZone?: string | null;
  feedback?: string;
  timeRequested?: number;
  reviews?: (string | number)[][] | null;
  piCountry?: string | null;
  piOrg?: string | null;
  accessRoute?: string | null;
};

const fapDataRow = container.resolve<FapDataRow>(Tokens.FapDataRow);

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

export const collectFapXLSXRowData = async (
  fapId: number,
  callId: number,
  user: UserWithRole
): Promise<{ sheetName: string; rows: RowObj[] }[]> => {
  const baseData = await fapDataSource.getFapReviewData(callId, fapId);

  const instrumentData = groupBy(baseData, 'instrument_id');

  const out: { sheetName: string; rows: RowObj[] }[] = [];

  for (const instrument in instrumentData) {
    const records = instrumentData[instrument];

    const sheetName = records[0].instrument_name;

    const rows = await Promise.all(
      records.map(async (proposal) => {
        const pi = await baseContext.queries.user.getBasic(
          user,
          proposal.proposer_id
        );

        const piFullName = `${pi?.firstname} ${pi?.lastname}`;

        const proposalAnswers =
          await baseContext.queries.questionary.getQuestionarySteps(
            user,
            proposal.questionary_id
          );

        const reviews = await baseContext.queries.review.reviewsForProposal(
          user,
          { proposalPk: proposal.proposal_pk, fapId: fapId }
        );

        const rowInput: FapDataRowInput = {
          proposalPk: proposal.proposal_pk,
          piName: piFullName,
          proposalAverageScore: proposal.average_grade,
          instrumentName: proposal.instrument_name,
          instrumentAvailabilityTime: proposal.availability_time,
          fapTimeAllocation: proposal.fap_time_allocation,
          proposalTitle: proposal.title,
          proposalId: proposal.proposal_id,
          techReviewTimeAllocation: proposal.time_allocation,
          technicalReviewComment: stripHtml(proposal.comment ?? ''),
          propFapRankOrder: proposal.rank_order,
          proposerId: proposal.proposer_id,
          proposalAnswers,
          reviews,
          instrumentId: proposal.instrument_id,
        };

        return fapDataRow(rowInput);
      })
    );

    out.push({
      sheetName:
        // Sheet names can't exceed 31 characters
        // use the short code and cut everything after 30 chars
        sheetName.substring(0, 30),
      rows,
    });
  }

  return out;
};

export const collectFapXLSXData = async (
  fapId: number,
  callId: number,
  user: UserWithRole
): Promise<{ data: FapXLSXData; filename: string }> => {
  collectCallFapXLSXData(fapId, user);

  const fap = await baseContext.queries.fap.get(user, fapId);
  const call = await baseContext.queries.call.get(user, callId);
  const filename = `Fap-${fap?.code}-${call?.shortCode}.xlsx`;

  const data = await collectFapXLSXRowData(fapId, callId, user);

  const transformedData: FapXLSXData = data.map((sheet) => {
    return {
      sheetName: sheet.sheetName,
      rows: sortByRankOrAverageScore(sheet.rows).map((row) => populateRow(row)),
    };
  });

  return {
    filename: filename.replace(/\s+/g, '_'),
    data: transformedData,
  };
};
export const collectFapReviewXLSXData = async (
  fapId: number,
  callId: number,
  reviewerProposals: Record<number, number[]>,
  user: UserWithRole
): Promise<{ data: FapXLSXData; filename: string }> => {
  const reviewData = await fapDataSource.getFapReviewData(callId, fapId);

  const data: FapXLSXData = [];
  for (const [reviewerIdString, proposalPks] of Object.entries(
    reviewerProposals
  )) {
    const reviewerId = Number(reviewerIdString);

    const reviewer = await baseContext.queries.user.getBasic(user, reviewerId);

    const reviewerName =
      `${reviewer?.firstname ?? ''} ${reviewer?.lastname ?? ''}`.trim();
    const rows: Array<Array<string | number>> = [];
    for (const proposalPk of proposalPks) {
      const review = reviewData.find((item) => item.proposal_pk === proposalPk);

      if (!review) {
        continue;
      }

      const assignments = await fapDataSource.getFapProposalAssignments(
        fapId,
        proposalPk,
        reviewerId
      );

      const assignment = assignments.find(
        (item) => item.fapMemberUserId === reviewerId
      );

      if (!assignment) {
        continue;
      }

      rows.push(
        buildReviewRow({
          proposalId: review.proposal_id,
          title: review.title ?? '-',
          instrumentName: review.instrument_name ?? '-',
          dateAssigned: formatDate(assignment.dateAssigned),
          rank: assignment.rank ?? null,
          grade: assignment.grade,
          comment: stripHtml(assignment.comment ?? '-'),
          status: assignment.status == 1 ? 'Complete' : 'Draft',
        })
      );
    }
    data.push({
      sheetName: reviewerName.substring(0, 31),
      rows,
    });
  }

  return {
    filename: 'fap_reviews.xlsx',
    data,
  };
};

const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) return '-';

  const dt =
    typeof value === 'string'
      ? DateTime.fromISO(value)
      : DateTime.fromJSDate(value);

  return dt.isValid ? dt.toFormat('dd-MM-yyyy') : '-';
};
