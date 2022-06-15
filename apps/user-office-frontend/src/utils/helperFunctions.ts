import { Column } from '@material-table/core';
import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';

import { SortDirectionType } from 'components/common/SuperMaterialTable';
import { Proposal, ProposalEndStatus, ProposalStatus } from 'generated/sdk';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';

import {
  average,
  getGradesFromReviews,
  standardDeviation,
} from './mathFunctions';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getUniqueArrayBy = (roles: any[], uniqueBy: string): any[] => {
  const result = [];
  const map = new Map<number, boolean>();
  for (const item of roles) {
    if (!map.has(item[uniqueBy])) {
      map.set(item.id, true);
      result.push(item);
    }
  }

  return result;
};

export const setSortDirectionOnSortColumn = (
  columns: Column<any>[],
  sortColumn: number | null | undefined,
  sortDirection: string | null | undefined
) => {
  if (sortColumn !== undefined && sortColumn !== null && sortDirection) {
    columns[sortColumn].defaultSort = sortDirection as SortDirectionType;
  }

  return columns;
};

export const getProposalStatus = (
  proposal: {
    status: ProposalStatus | null;
    finalStatus?: ProposalEndStatus | null | undefined;
    notified: boolean;
  } | null
): string | null => {
  if (proposal?.notified) {
    return getTranslation(proposal.finalStatus as ResourceId);
  } else {
    return proposal?.status?.name || null;
  }
};

export const fromProposalToProposalView = (proposal: Proposal) => {
  return {
    primaryKey: proposal.primaryKey,
    title: proposal.title,
    status: proposal.status?.name || '',
    statusId: proposal.status?.id || 1,
    statusName: proposal.status?.name || '',
    statusDescription: proposal.status?.description || '',
    submitted: proposal.submitted,
    proposalId: proposal.proposalId,
    rankOrder: proposal.sepMeetingDecision?.rankOrder,
    finalStatus: getTranslation(proposal.finalStatus as ResourceId),
    technicalTimeAllocation: proposal.technicalReview?.timeAllocation || null,
    technicalReviewAssigneeId:
      proposal.technicalReview?.technicalReviewAssigneeId || null,
    technicalReviewAssigneeFirstName:
      proposal.technicalReview?.technicalReviewAssignee?.firstname || null,
    technicalReviewAssigneeLastName:
      proposal.technicalReview?.technicalReviewAssignee?.lastname || null,
    managementTimeAllocation: proposal.managementTimeAllocation || null,
    technicalStatus: getTranslation(
      proposal.technicalReview?.status as ResourceId
    ),
    instrumentName: proposal.instrument?.name || null,
    instrumentId: proposal.instrument?.id || null,
    reviewAverage:
      average(getGradesFromReviews(proposal.reviews ?? [])) || null,
    reviewDeviation:
      standardDeviation(getGradesFromReviews(proposal.reviews ?? [])) || null,
    sepCode: proposal.sep?.code,
    callShortCode: proposal.call?.shortCode || null,
    notified: proposal.notified,
    callId: proposal.callId,
    allocationTimeUnit: proposal.call?.allocationTimeUnit,
  } as ProposalViewData;
};

export const capitalize = (s: string) =>
  s && s[0].toUpperCase() + s.slice(1).toLocaleLowerCase();

export const addColumns = <T extends object>(
  columns: Column<T>[],
  columnsToAdd: Column<T>[]
) => {
  columnsToAdd.forEach((columnToAdd) => {
    if (!columns.find((column) => column.field === columnToAdd.field)) {
      columns.push({
        ...columnToAdd,
      });
    }
  });
};

export const removeColumns = <T extends object>(
  columns: Column<T>[],
  columnsToRemove: Column<T>[]
) => {
  columnsToRemove.forEach((columnToRemove) => {
    const columnIndex = columns.findIndex(
      (column) => column.field === columnToRemove.field
    );
    if (columnIndex !== -1) {
      columns.splice(columnIndex, 1);
    }
  });
};
