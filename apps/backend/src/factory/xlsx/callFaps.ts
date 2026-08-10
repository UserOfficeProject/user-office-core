import { container } from 'tsyringe';

import { RowObj, collectFapXLSXRowData } from './fap';
import { callFapPopulateRow } from './FapDataRow';
import baseContext from '../../buildContext';
import { callFapStfcPopulateRow } from './stfc/StfcFapDataRow';
import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { InstrumentDataSource } from '../../datasources/InstrumentDataSource';
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

const collectFinalDecisionData = async (
  fapId: number,
  callId: number,
  user: UserWithRole,
  instrumentName: string
) => {
  const finalDecisionColumns = [
    'Proposal Reference Number',
    'Principal Investigator',
    'Instrument Name',
    'Instrument available time', // Instrument available time, running total field of the instrument available time minus previous proposal allocations
    'FAP allocated time', // Awarded Time, time recommendation from FAP process
    'FAP Meeting Decision', // Decision (FAP Meeting Decision) recommendation from FAP process
    'FAP comment to user', // Comment to user (FAP Comment to user)
    'Internal comments', // Internal comments
    'Technical Review comments', // Technical assessment Comment to management
    'FAP comments', // FAP meeting Comment to management
  ];
  const baseData = await fapDataSource.getFapReviewData(callId, fapId);
  const returnData = baseData.map((fapreview) => {
    return [
      fapreview.proposal_id.toString(),
      'aaron',
      instrumentName,
      fapreview.availability_time.toString(),
      fapreview.time_allocation.toString(),
      'zac2',
      'zac1',
      'zac2',
      'zac1',
      'zac2',
      'zac1',
      'zac12',
      'zac13',
    ];
  });
  const principalInvestigator = '';

  return returnData;
};

export const collectFinalDecisionXLSXData = async (
  callId: number,
  user: UserWithRole
) => {
  const faps = await baseContext.queries.fap.dataSource.getFapsByCallId(callId);
  const instrumentDataSource = container.resolve<InstrumentDataSource>(
    Tokens.InstrumentDataSource
  );
  const instruments = await instrumentDataSource.getInstrumentsByCallId(
    [callId],
    true
  );
  const call = await baseContext.queries.call.get(user, callId);
  const filename = `${call?.shortCode}_FAP_Results.xlsx`;

  const baseData2 = await Promise.all(
    instruments.map(async (instrument) => {
      const newRows = [] as string[][];
      for (const fap of faps) {
        const rowOfInstrument = await collectFinalDecisionData(
          fap.id,
          callId,
          user,
          instrument.name
        );
        for (const row of rowOfInstrument) {
          newRows.push(row);
        }
      }

      return {
        sheetName: instrument.name,
        rows: newRows,
      };
    })
  );

  return { data: baseData2, filename: filename.replace(/\s+/g, '_') };
};

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
