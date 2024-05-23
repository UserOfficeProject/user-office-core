// import { Review } from '../../models/Review';
import { stripHtml } from 'string-strip-html';
import { container } from 'tsyringe';

import baseContext from '../../buildContext';
import { Tokens } from '../../config/Tokens';
import { FapDataSource } from '../../datasources/FapDataSource';
import { UserWithRole } from '../../models/User';
import { RowObj, collectFapXLSXRowData } from './fap';

const fapDataSource: FapDataSource = container.resolve(Tokens.FapDataSource);

type CallProposalXLSXData = Array<{
  sheetName: string;
  rows: Array<Array<string | number>>;
}>;

export type CallRowRowObj = RowObj & {
  fapMeetingDecision?: string | null;
  fapMeetingExComment?: string | null;
  fapMeetingInComment?: string | null;
};

export const collectCallFapXLSXData = async (
  callId: number,
  user: UserWithRole
  // }): Promise<{ data: any; filename: string }> => {
) => {
  const faps = await baseContext.queries.fap.dataSource.getFapsByCallId(callId);
  const call = await baseContext.queries.call.get(user, callId);
  // TODO: decide on filename
  const filename = `${call?.shortCode}-FAP-Results.xlsx`;

  const baseData = await Promise.all(
    faps.map(async (fap) => {
      return {
        sheetName: fap.code,
        rows: await collectFAPRowData(fap.id, callId, user),
      };
    })
  );

  //   const combineSheets = extraData.map((fap) => {
  //     return fap.reduce((arr, inst) => {
  //       return arr.concat({ sheetName: 'temp', rows: inst.rows });
  //     });
  //   });

  //   // eslint-disable-next-line no-console
  //   extraData.map((d) => d.map((r) => console.log(r)));

  //   console.log(baseData[0].rows);

  return { data: baseData, filename: 'temp' };
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
              fapMeetingDecision: fapMeetingDecision[0]
                ? fapMeetingDecision[0].recommendation
                : null,
              fapMeetingExComment: fapMeetingDecision[0]
                ? stripHtml(fapMeetingDecision[0].commentForUser).result
                : null,
              fapMeetingInComment: fapMeetingDecision[0]
                ? stripHtml(fapMeetingDecision[0].commentForManagement).result
                : null,
            };
          })
        ),
      };
    })
  );

  //   console.log(extraData);

  // extraData.map((inst) => console.log(inst));

  const allRowData = extraData.map((inst) => {
    const instName: (string | number)[][] = [[inst.sheetName]];

    const sortedData = sortByRankOrAverageScore(inst.rows).map(
      (row: CallRowRowObj) => populateRow(row)
    );

    instName.concat(instName);

    return instName.concat(sortedData);
  });

  return allRowData.length
    ? allRowData.reduce((arr, inst) => {
        return arr.concat(inst);
      })
    : allRowData;
};

function populateRow(row: CallRowRowObj): (string | number)[] {
  const individualReviews = row.reviews?.flatMap((rev) => [
    rev.grade,
    rev.comment && stripHtml(rev.comment).result,
  ]);

  return [
    row.propShortCode ?? '<missing>',
    row.principalInv ?? '<missing>',
    row.piCountry ?? '<missing>',
    row.instrName ?? '<missing>',
    row.daysRequested ?? '<missing>',
    row.propTitle ?? '<missing>',
    row.propReviewAvgScore ?? '<missing>',
    row.fapTimeAllocation ?? row.daysRequested ?? '<missing>',
    row.fapMeetingDecision ?? '<missing>',
    row.fapMeetingInComment ?? '<missing>',
    row.fapMeetingExComment ?? '<missing>',
  ].concat(individualReviews ? individualReviews : []);
}

export const CallFapDataColumns = [
  'Proposal Reference Number',
  'Principal Investigator',
  'PI Country',
  'Instrument Name',
  'Requested Time',
  'Proposal Title',
  'Average score',
  'Fap Time allocation',
  'Fap Meeting Decision',
  'Fap Meeting Comment for User',
  'Fap Meeting Internal Comment',
  'Reviewer 1 score',
  'Reviewer 1 review comment',
  'Reviewer 2 score',
  'Reviewer 2 review comment',
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
