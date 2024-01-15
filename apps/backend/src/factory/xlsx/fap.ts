import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { UserWithRole } from '../../models/User';
import { average, getGrades } from '../../utils/mathFunctions';
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
};

const fapDataRow = container.resolve<typeof getDataRow | typeof getStfcDataRow>(
  Tokens.FapDataRow
);

const populateRow = container.resolve<(row: RowObj) => (string | number)[]>(
  Tokens.PopulateRow
);

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

export const collectFaplXLSXData = async (
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

  const instrumentsFapProposals = await Promise.all(
    instruments.map((instrument) => {
      return baseContext.queries.fap.getFapProposalsByInstrument(user, {
        fapId,
        callId,
        instrumentId: instrument.id,
      });
    })
  );

  const instrumentsProposals = await Promise.all(
    instrumentsFapProposals.map((fapProposalPks) => {
      if (!fapProposalPks) {
        const instrumentIds = instruments.map(({ id }) => id).join(', ');

        throw new Error(
          `Fap with ID '${fapId}'/` +
            `Call with ID '${callId}/'` +
            `Instruments with IDs '${instrumentIds}' not found, or the user has insufficient rights`
        );
      }

      return Promise.all(
        fapProposalPks.map(({ proposalPk }) =>
          baseContext.queries.proposal.dataSource.get(proposalPk)
        )
      );
    })
  );

  const proposalsReviews = await Promise.all(
    instrumentsProposals.map((proposals) => {
      return Promise.all(
        proposals.map((proposal) =>
          proposal
            ? baseContext.queries.review.reviewsForProposal(
                user,
                proposal.primaryKey
              )
            : null
        )
      );
    })
  );

  const proposalsTechnicalReviews = await Promise.all(
    instrumentsProposals.map((proposals) => {
      return Promise.all(
        proposals.map((proposal) =>
          proposal
            ? baseContext.queries.review.technicalReviewsForProposal(
                user,
                proposal.primaryKey
              )
            : null
        )
      );
    })
  );

  const proposalsFapMeetingDecisions = await Promise.all(
    instrumentsProposals.map((proposals) => {
      return Promise.all(
        proposals.map((proposal) =>
          proposal
            ? baseContext.queries.fap.getProposalFapMeetingDecision(
                user,
                proposal.primaryKey
              )
            : null
        )
      );
    })
  );

  const proposalsPrincipalInvestigators = await Promise.all(
    instrumentsProposals.map((proposals) => {
      return Promise.all(
        proposals.map((proposal) =>
          proposal
            ? baseContext.queries.user.getBasic(user, proposal.proposerId)
            : null
        )
      );
    })
  );

  const out: FapXLSXData = [];

  instruments.forEach((instrument, indx) => {
    const proposals = instrumentsProposals[indx];
    const proposalReviews = proposalsReviews[indx];
    const proposalPrincipalInvestigators =
      proposalsPrincipalInvestigators[indx];
    const technicalReviews = proposalsTechnicalReviews[indx];
    const fapProposals = instrumentsFapProposals[indx];
    const fapMeetingDecisions = proposalsFapMeetingDecisions[indx];

    const rows = proposals.map((proposal, pIndx) => {
      const { firstname = '<missing>', lastname = '<missing>' } =
        proposalPrincipalInvestigators[pIndx] ?? {};
      const technicalReview =
        technicalReviews[pIndx]?.find(
          (technicalReview) => technicalReview.instrumentId === instrument.id
        ) || null;
      const reviews = proposalReviews[pIndx];
      const fapProposal = fapProposals?.[pIndx];
      const fapMeetingDecision = fapMeetingDecisions[pIndx];

      const proposalAverageScore = average(getGrades(reviews)) || 0;

      return fapDataRow(
        `${firstname} ${lastname}`,
        proposalAverageScore,
        instrument,
        fapMeetingDecision,
        proposal,
        technicalReview,
        fapProposal
      );
    });

    out.push({
      sheetName:
        // Sheet names can't exceed 31 characters
        // use the short code and cut everything after 30 chars
        instrument.shortCode.substr(0, 30),
      rows: sortByRankOrAverageScore(rows).map((row) => populateRow(row)),
    });
  });

  return {
    data: out,
    filename: filename.replace(/\s+/g, '_'),
  };
};
