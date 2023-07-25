import baseContext from '../../buildContext';
import { UserWithRole } from '../../models/User';
import { average, getGrades } from '../../utils/mathFunctions';

type SEPXLSXData = Array<{
  sheetName: string;
  rows: Array<Array<string | number>>;
}>;

type RowObj = {
  propShortCode?: string;
  propTitle?: string;
  principalInv: string;
  instrAvailTime?: number;
  techReviewTimeAllocation?: number | null;
  sepTimeAllocation: number | null;
  propReviewAvgScore?: number;
  propSEPRankOrder: number | null;
  inAvailZone?: string | null;
};

export const defaultSEPDataColumns = [
  'Proposal Short Code',
  'Proposal Title',
  'Principal Investigator',
  'Instrument available time',
  'Technical review allocated time',
  'SEP allocated time',
  'Average Score',
  'Current rank',
  'Is in availability zone',
];

const sortByRankOrder = (a: RowObj, b: RowObj) => {
  if (a.propSEPRankOrder === b.propSEPRankOrder) {
    return -1;
  } else if (a.propSEPRankOrder === null) {
    return 1;
  } else if (b.propSEPRankOrder === null) {
    return -1;
  } else {
    return a.propSEPRankOrder > b.propSEPRankOrder ? 1 : -1;
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
        row.sepTimeAllocation !== null
          ? row.sepTimeAllocation
          : row.techReviewTimeAllocation || 0;

      const isInAvailabilityZone =
        allocationTimeSum + proposalAllocationTime <= (row.instrAvailTime || 0);
      allocationTimeSum = allocationTimeSum + proposalAllocationTime;

      row.inAvailZone = isInAvailabilityZone ? 'yes' : 'no';

      return row;
    });
};

export const collectSEPlXLSXData = async (
  sepId: number,
  callId: number,
  user: UserWithRole
): Promise<{ data: SEPXLSXData; filename: string }> => {
  const sep = await baseContext.queries.sep.get(user, sepId);
  const call = await baseContext.queries.call.get(user, callId);

  // TODO: decide on filename
  const filename = `SEP-${sep?.code}-${call?.shortCode}.xlsx`;

  const instruments =
    await baseContext.queries.instrument.getInstrumentsBySepId(user, {
      sepId,
      callId,
    });

  if (!instruments) {
    throw new Error(
      `SEP with ID '${sepId}'/Call with ID '${callId}' not found, or the user has insufficient rights`
    );
  }

  const instrumentsSepProposals = await Promise.all(
    instruments.map((instrument) => {
      return baseContext.queries.sep.getSEPProposalsByInstrument(user, {
        sepId,
        callId,
        instrumentId: instrument.id,
      });
    })
  );

  const instrumentsProposals = await Promise.all(
    instrumentsSepProposals.map((sepProposalPks) => {
      if (!sepProposalPks) {
        const instrumentIds = instruments.map(({ id }) => id).join(', ');

        throw new Error(
          `SEP with ID '${sepId}'/` +
            `Call with ID '${callId}/'` +
            `Instruments with IDs '${instrumentIds}' not found, or the user has insufficient rights`
        );
      }

      return Promise.all(
        sepProposalPks.map(({ proposalPk }) =>
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
            ? baseContext.queries.review.technicalReviewForProposal(
                user,
                proposal.primaryKey
              )
            : null
        )
      );
    })
  );

  const proposalsSepMeetingDecisions = await Promise.all(
    instrumentsProposals.map((proposals) => {
      return Promise.all(
        proposals.map((proposal) =>
          proposal
            ? baseContext.queries.sep.getProposalSepMeetingDecision(
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

  const out: SEPXLSXData = [];

  instruments.forEach((instrument, indx) => {
    const proposals = instrumentsProposals[indx];
    const proposalReviews = proposalsReviews[indx];
    const proposalPrincipalInvestigators =
      proposalsPrincipalInvestigators[indx];
    const technicalReviews = proposalsTechnicalReviews[indx];
    const sepProposals = instrumentsSepProposals[indx];
    const sepMeetingDecisions = proposalsSepMeetingDecisions[indx];

    const rows = proposals.map((proposal, pIndx) => {
      const { firstname = '<missing>', lastname = '<missing>' } =
        proposalPrincipalInvestigators[pIndx] ?? {};
      const technicalReview = technicalReviews[pIndx];
      const reviews = proposalReviews[pIndx];
      const sepProposal = sepProposals?.[pIndx];
      const sepMeetingDecision = sepMeetingDecisions[pIndx];

      const proposalAverageScore = average(getGrades(reviews)) || 0;

      return {
        propShortCode: proposal?.proposalId,
        propTitle: proposal?.title,
        principalInv: `${firstname} ${lastname}`,
        instrAvailTime: instrument.availabilityTime,
        techReviewTimeAllocation: technicalReview?.timeAllocation,
        sepTimeAllocation: sepProposal?.sepTimeAllocation ?? null,
        propReviewAvgScore: proposalAverageScore,
        propSEPRankOrder: sepMeetingDecision?.rankOrder ?? null,
        inAvailZone: null,
      };
    });

    out.push({
      sheetName:
        // Sheet names can't exceed 31 characters
        // use the short code and cut everything after 30 chars
        instrument.shortCode.substr(0, 30),
      rows: sortByRankOrAverageScore(rows).map((row) => [
        row.propShortCode ?? '<missing>',
        row.propTitle ?? '<missing>',
        row.principalInv,
        row.instrAvailTime ?? '<missing>',
        row.techReviewTimeAllocation ?? '<missing>',
        row.sepTimeAllocation ?? row.techReviewTimeAllocation ?? '<missing>',
        row.propReviewAvgScore ?? '<missing>',
        row.propSEPRankOrder ?? '<missing>',
        row.inAvailZone ?? '<missing>',
      ]),
    });
  });

  return {
    data: out,
    filename: filename.replace(/\s+/g, '_'),
  };
};
