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

  const rowsOfManagmentDecisions = managementDecisionData.map(
    (data) => data.xlsxrowdata
  );

  return rowsOfManagmentDecisions;
};

export async function generateManagementDecisionData(
  agent: UserWithRole,
  fapreview: FapReviewsRecord
) {
  const principalInvestigatorInfo = await baseContext.queries.user.get(
    agent,
    fapreview.proposer_id
  );
  const fapMeetingData =
    await baseContext.queries.fap.getProposalFapMeetingDecisions(agent, {
      proposalPk: fapreview.proposal_pk,
    });

  const instrumentAllocatedTime = fapreview.fap_time_allocation
    ? fapreview.fap_time_allocation
    : fapreview.time_allocation;

  const fapMeetingRecommendation =
    fapMeetingData[0] && fapMeetingData[0].recommendation
      ? ProposalEndStatusStringValue[fapMeetingData[0].recommendation]
      : ProposalEndStatusStringValue[0];

  return {
    grade: fapreview.average_grade ?? 0,
    instrumentAllocatedTime: instrumentAllocatedTime ?? 0,
    xlsxrowdata: [
      fapreview.proposal_id.toString() ?? '<missing>',
      `${principalInvestigatorInfo?.firstname} ${principalInvestigatorInfo?.lastname}`,
      '<missing>', // Running total of remaining instrument time. (filled in later)
      instrumentAllocatedTime
        ? instrumentAllocatedTime.toString()
        : '<missing>',
      fapMeetingRecommendation,
      fapMeetingData?.[0]?.commentForUser
        ? stripHtml(fapMeetingData[0].commentForUser)
        : '<missing>',
      fapMeetingData?.[0]?.commentForManagement
        ? stripHtml(fapMeetingData[0].commentForManagement)
        : '<missing>',
      fapreview.comment ? stripHtml(fapreview.comment) : '<missing>',
    ],
  };
}

export function addDecreasingInstrumentAvailTime(
  managementDecisionData: {
    grade: number;
    instrumentAllocatedTime: number;
    xlsxrowdata: string[];
  }[],
  instrumentAvailableTime: number
) {
  //Sort by grade so the rows are in order, and the allocated time decreases from first to last.
  managementDecisionData.sort((a, b) => a.grade - b.grade);
  let remainingInstrumentTime = instrumentAvailableTime;
  for (let i = 0; i < managementDecisionData.length; i++) {
    remainingInstrumentTime =
      remainingInstrumentTime -
      managementDecisionData[i].instrumentAllocatedTime;
    const timeToShowToUser = Math.max(remainingInstrumentTime, 0).toString();
    managementDecisionData[i].xlsxrowdata[2] = timeToShowToUser;
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
  const rowsOfManagmentDecisions = [] as string[][];
  for (const fap of faps) {
    const fapReviewsRows = await collectManagementDecisionData(
      fap.id,
      callId,
      agent,
      instrumentId
    );
    for (const row of fapReviewsRows) {
      if (row) {
        rowsOfManagmentDecisions.push(row);
      }
    }
  }

  return rowsOfManagmentDecisions;
}
