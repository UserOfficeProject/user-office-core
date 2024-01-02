/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column } from '@material-table/core';
import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';
import React from 'react';
import * as Yup from 'yup';

import { SortDirectionType } from 'components/common/SuperMaterialTable';
import {
  Proposal,
  ProposalEndStatus,
  ProposalStatus,
  Scalars,
} from 'generated/sdk';
import { ProposalViewData } from 'hooks/proposal/useProposalsCoreData';

import {
  average,
  getGradesFromReviews,
  standardDeviation,
} from './mathFunctions';
import { FunctionType } from './utilTypes';

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
    principalInvestigator: proposal.proposer || null,
    title: proposal.title,
    status: proposal.status?.name || '',
    statusId: proposal.status?.id || 1,
    statusName: proposal.status?.name || '',
    statusDescription: proposal.status?.description || '',
    submitted: proposal.submitted,
    proposalId: proposal.proposalId,
    rankOrder: proposal.fapMeetingDecision?.rankOrder,
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
    fapId: proposal.fap?.id,
    fapCode: proposal.fap?.code,
    callShortCode: proposal.call?.shortCode || null,
    notified: proposal.notified,
    callId: proposal.callId,
    workflowId: proposal.call?.proposalWorkflowId,
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

export const isCallEnded = (
  startDate: Scalars['DateTime']['input'],
  endDate: Scalars['DateTime']['input']
) => {
  if (!startDate || !endDate) {
    return true;
  }
  const now = new Date();
  const startCall = new Date(startDate);
  const endCall = new Date(endDate);

  return startCall >= now || endCall <= now;
};

export const urlValidationSchema = () => {
  return Yup.string()
    .matches(
      /https?:\/\/(((www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,63})|(localhost))\b([-a-zA-Z0-9@:%_\+.~#?&/=]*)/i,
      'Provide a valid URL that includes the HTTP or HTTPS protocol'
    )
    .required('URL is required');
};

export const getValueFromKey = (object: any, key: string | undefined) => {
  return key?.split('.').reduce((o, i) => o[i], object);
};

export const denseTableColumn = <T extends object>(
  column: Column<T>
): Column<T> => {
  const cellStyleIsFunction = typeof column.cellStyle === 'function';
  const cellStyle = column.cellStyle
    ? {
        ...(cellStyleIsFunction
          ? (column.cellStyle as FunctionType)()
          : column.cellStyle),
      }
    : undefined;

  return {
    ...column,
    render(rowData) {
      const columnData = getValueFromKey(rowData, column.field?.toString());

      // NOTE: If it is more than 50 chars then show the title tooltip
      if (typeof columnData === 'string' && columnData.length > 45) {
        return (
          <span title={columnData}>
            {column.render ? column.render(rowData, 'row') : columnData}
          </span>
        );
      } else {
        if (column.lookup) {
          return column.lookup[columnData as keyof object];
        }

        return (
          <>{column.render ? column.render(rowData, 'row') : columnData}</>
        );
      }
    },
    cellStyle: {
      ...cellStyle,
      whiteSpace: 'nowrap',
      maxWidth: '400px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };
};

/**NOTE:
 * This helper function improves the space usage in the MaterialTable Columns by limiting column content to one line
 * and showing indicator(three dots) if there is more to be seen on hover.
 */
export const denseTableColumns = <T extends object>(columns: Column<T>[]) =>
  columns.map((column) => {
    return denseTableColumn(column);
  });
