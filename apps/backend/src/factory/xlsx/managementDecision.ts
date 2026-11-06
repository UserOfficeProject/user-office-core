import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { FapReviewsRecord } from '../../datasources/postgres/records';
import { ProposalEndStatus } from '../../models/Proposal';
import { UserWithRole } from '../../models/User';
import { stripHtml } from '../../utils/stringStripHtml';

const ProposalEndStatusStringValue = {
  [ProposalEndStatus.UNSET]: 'Unset',
  [ProposalEndStatus.ACCEPTED]: 'Accepted',
  [ProposalEndStatus.RESERVED]: 'Reserved',
  [ProposalEndStatus.REJECTED]: 'Rejected',
};

export const collectManagementDecisionData = async (
  fapId: number,
  callId: number,
  agent: UserWithRole,
  instrumentId: number
) => {
  const fapReviews = await baseContext.queries.fap.getFapReviewData(agent, {
    callId,
    fapId,
    instrumentId,
  });
  const managementDecisionData = await Promise.all(
    fapReviews.map(async (fapreview) => {
      return await generateManagementDecisionData(agent, fapreview);
    })
  );

  const instrumentAvailableTime = fapReviews[0]?.availability_time ?? 0;
  addDecreasingInstrumentAvailTime(
    managementDecisionData,
    instrumentAvailableTime
  );

  const rowsOfManagementDecisions = managementDecisionData.map(
    (data) => data.xlsxrowdata
  );

  return rowsOfManagementDecisions;
};

export async function generateManagementDecisionData(
  agent: UserWithRole,
  fapReview: FapReviewsRecord
) {
  const principalInvestigatorInfo = await baseContext.queries.user.get(
    agent,
    fapReview.proposer_id
  );
  const fapMeetingData =
    await baseContext.queries.fap.getProposalFapMeetingDecisions(agent, {
      proposalPk: fapReview.proposal_pk,
      fapId: fapReview.fap_id,
    });
  const fapMeetingDecision = fapMeetingData.find(
    (decision) => decision.fapProposalId === fapReview.fap_proposal_id
  );

  const instrumentAllocatedTime =
    fapReview.fap_time_allocation ?? fapReview.time_allocation;

  const fapMeetingRecommendation = fapMeetingDecision?.recommendation
    ? ProposalEndStatusStringValue[fapMeetingDecision.recommendation]
    : ProposalEndStatusStringValue[0];

  return {
    rankOrder: fapReview.rank_order ?? 0,
    instrumentAllocatedTime: instrumentAllocatedTime ?? '<missing>',
    xlsxrowdata: [
      fapReview.proposal_id.toString() ?? '<missing>',
      fapReview.proposal_pk.toString() ?? '<missing>',
      fapReview.instrument_id.toString() ?? '<missing>',
      fapReview.instrument_name.toString() ?? '<missing>',
      `${principalInvestigatorInfo?.firstname} ${principalInvestigatorInfo?.lastname}`,
      '<missing>', // Running total of remaining instrument time. (filled in later)
      instrumentAllocatedTime?.toString() ?? '<missing>',
      fapMeetingRecommendation,
      fapMeetingDecision?.commentForUser != null
        ? stripHtml(fapMeetingDecision.commentForUser)
        : '<missing>',
      fapMeetingDecision?.commentForManagement != null
        ? stripHtml(fapMeetingDecision.commentForManagement)
        : '<missing>',
      fapReview.comment != null ? stripHtml(fapReview.comment) : '<missing>',
    ],
  };
}

export function addDecreasingInstrumentAvailTime(
  managementDecisionData: {
    rankOrder: number;
    instrumentAllocatedTime: number;
    xlsxrowdata: string[];
  }[],
  instrumentAvailableTime: number
) {
  // Sort by rank so the rows are in order, and the allocated time decreases from first to last.
  managementDecisionData.sort((a, b) => a.rankOrder - b.rankOrder);
  let remainingInstrumentTime = instrumentAvailableTime;
  for (let i = 0; i < managementDecisionData.length; i++) {
    remainingInstrumentTime =
      remainingInstrumentTime -
      managementDecisionData[i].instrumentAllocatedTime;
    const timeToShowToUser = Math.max(remainingInstrumentTime, 0).toString();
    managementDecisionData[i].xlsxrowdata[5] = timeToShowToUser;
  }
}

export const collectManagementDecisionXLSXData = async (
  callId: number,
  agent: UserWithRole
) => {
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const instruments = await instrumentDataSource.getInstrumentsByCallId(
    [callId],
    true
  );
  const call = await baseContext.queries.call.get(agent, callId);
  const filename = `${call?.shortCode}_management_decision.xlsx`;
  const xlsxData = await Promise.all(
    instruments.map(async (instrument) => {
      return {
        sheetName: instrument.name,
        rows: await generateManagementDecisionRowsByInstrument(
          agent,
          callId,
          instrument.id
        ),
      };
    })
  );

  return { data: xlsxData, filename: filename.replace(/\s+/g, '_') };
};

async function generateManagementDecisionRowsByInstrument(
  agent: UserWithRole,
  callId: number,
  instrumentId: number
) {
  const faps = await baseContext.queries.fap.dataSource.getFapsByCallId(callId);
  const rowsOfManagementDecisions = (
    await Promise.all(
      faps.map((fap) =>
        collectManagementDecisionData(fap.id, callId, agent, instrumentId)
      )
    )
  )
    .flat()
    .filter((row) => row !== undefined && row !== null);

  return rowsOfManagementDecisions;
}
