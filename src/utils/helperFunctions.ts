import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import { Column } from 'material-table';

import { SortDirectionType } from 'components/common/SuperMaterialTable';
import { Proposal, ProposalEndStatus, ProposalStatus } from 'generated/sdk';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';

import { average, getGrades, standardDeviation } from './mathFunctions';

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
    id: proposal.id,
    title: proposal.title,
    status: proposal.status?.name || '',
    statusId: proposal.status?.id || 1,
    statusName: proposal.status?.name || '',
    statusDescription: proposal.status?.description || '',
    submitted: proposal.submitted,
    shortCode: proposal.shortCode,
    rankOrder: proposal.rankOrder,
    finalStatus: getTranslation(proposal.finalStatus as ResourceId),
    timeAllocation: proposal.technicalReview?.timeAllocation || null,
    technicalStatus: getTranslation(
      proposal.technicalReview?.status as ResourceId
    ),
    instrumentName: proposal.instrument?.name || null,
    instrumentId: proposal.instrument?.id || null,
    reviewAverage: average(getGrades(proposal.reviews)) || null,
    reviewDeviation: standardDeviation(getGrades(proposal.reviews)) || null,
    sepCode: proposal.sep?.code,
    callShortCode: proposal.call?.shortCode || null,
    notified: proposal.notified,
    callId: proposal.callId,
  } as ProposalViewData;
};
