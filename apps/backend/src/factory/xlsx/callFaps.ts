import { container } from 'tsyringe';

import { RowObj, collectFapXLSXRowData } from './fap';
import { callFapPopulateRow } from './FapDataRow';
import baseContext from '../../buildContext';
import { callFapStfcPopulateRow } from './stfc/StfcFapDataRow';
import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
import { Instrument } from '../../models/Instrument';
import { ProposalEndStatus } from '../../models/Proposal';
import { UserWithRole } from '../../models/User';
import { stripHtml } from '../../utils/stringStripHtml';

const fapDataSource: FapDataSource = container.resolve(Tokens.FapDataSource);

const callFapDataRow = container.resolve<
  typeof callFapPopulateRow | typeof callFapStfcPopulateRow
>(Tokens.PopulateCallRow);

const ProposalEndStatusStringValue = {
  [ProposalEndStatus.UNSET]: 'Unset',
  [ProposalEndStatus.ACCEPTED]: 'Accepted',
  [ProposalEndStatus.RESERVED]: 'Reserved',
  [ProposalEndStatus.REJECTED]: 'Rejected',
};

export type CallRowObj = RowObj & {
  fapMeetingDecision?: string | null;
  fapMeetingExComment?: string | null;
  fapMeetingInComment?: string | null;
};

const collectFAPRowData = async (
  fapId: number,
  callId: number,
  user: UserWithRole
) => {
  const data = await collectFapXLSXRowData(fapId, callId, user);

  const extraData = await Promise.all(
    data.map(async (sheet) => {
      return {
        sheetName: sheet.sheetName,
        rows: await Promise.all(
          sheet.rows.map(async (proposal) => {
            const fapMeetingDecision =
              await fapDataSource.getProposalsFapMeetingDecisions([
                proposal.proposalPk,
              ]);

            return {
              ...proposal,
              fapMeetingDecision:
                fapMeetingDecision[0] && fapMeetingDecision[0].recommendation
                  ? ProposalEndStatusStringValue[
                      fapMeetingDecision[0].recommendation
                    ]
                  : null,
              fapMeetingExComment:
                fapMeetingDecision[0] && fapMeetingDecision[0].commentForUser
                  ? stripHtml(fapMeetingDecision[0].commentForUser)
                  : null,
              fapMeetingInComment:
                fapMeetingDecision[0] &&
                fapMeetingDecision[0].commentForManagement
                  ? stripHtml(fapMeetingDecision[0].commentForManagement)
                  : null,
            };
          })
        ),
      };
    })
  );

  const allRowData = extraData.map((inst) => {
    const instName: (string | number)[][] = [[inst.sheetName]];

    const sortedData = sortByRankOrAverageScore(inst.rows).map(
      (row: CallRowObj) => callFapDataRow(row)
    );

    return instName.concat(sortedData);
  });

  return allRowData.length
    ? allRowData.reduce((arr, inst) => {
        return arr.concat(inst);
      })
    : allRowData;
};

export const collectCallFapXLSXData = async (
  callId: number,
  user: UserWithRole
) => {
  const faps = await baseContext.queries.fap.dataSource.getFapsByCallId(callId);
  const call = await baseContext.queries.call.get(user, callId);
  const filename = `${call?.shortCode}_FAP_Results.xlsx`;

  const baseData = await Promise.all(
    faps.map(async (fap) => {
      return {
        sheetName: fap.code.substring(0, 30),
        rows: await collectFAPRowData(fap.id, callId, user),
      };
    })
  );

  return { data: baseData, filename: filename.replace(/\s+/g, '_') };
};

const collectManagementDecisionData = async (
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
  let instrumentAvailableTime = fapReviews[0]?.availability_time ?? 0;

  const returnData = await Promise.all(
    fapReviews.map(async (fapreview) => {
      const proposalInfo = await baseContext.queries.proposal.get(
        agent,
        fapreview.proposal_pk
      );
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
          '<missing>', // Running total of remaining instrument time. (filled in later below)
          instrumentAllocatedTime
            ? instrumentAllocatedTime.toString()
            : '<missing>',
          fapMeetingRecommendation,
          fapMeetingData?.[0]?.commentForUser ?? '<missing>',
          fapMeetingData?.[0]?.commentForManagement ?? '<missing>',
          proposalInfo?.commentForManagement ?? '<missing>',
          fapreview.comment ?? '<missing>',
        ],
      };
    })
  );

  const orderedDataByGrade = returnData.sort((data) => data.grade);
  const finalData = [] as string[][];
  for (const proposaldataobject of orderedDataByGrade) {
    // Adds the running total of remaining instrument time.
    const xlsxRowData = proposaldataobject.xlsxrowdata;
    instrumentAvailableTime =
      instrumentAvailableTime - proposaldataobject.instrumentAllocatedTime;
    xlsxRowData[2] = instrumentAvailableTime.toString();
    finalData.push(xlsxRowData);
  }

  return finalData;
};

export const collectFinalDecisionXLSXData = async (
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
      return generateXLSXPageDataForInstrument(agent, callId, instrument);
    })
  );

  return { data: xlsxData, filename: filename.replace(/\s+/g, '_') };
};

async function generateXLSXPageDataForInstrument(
  agent: UserWithRole,
  callId: number,
  instrument: Instrument
) {
  const faps = await baseContext.queries.fap.dataSource.getFapsByCallId(callId);
  const xlsxPageData = [] as string[][];
  for (const fap of faps) {
    const fapReviewsRows = await collectManagementDecisionData(
      fap.id,
      callId,
      agent,
      instrument.id
    );
    for (const row of fapReviewsRows) {
      if (row) {
        xlsxPageData.push(row);
      }
    }
  }

  return {
    sheetName: instrument.name,
    rows: xlsxPageData,
  };
}

export const DefaultCallExtraFapDataColumns = [
  'Fap Time allocation',
  'Fap Meeting Decision',
  'Fap Meeting Comment for User',
  'Fap Meeting Internal Comment',
];

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
