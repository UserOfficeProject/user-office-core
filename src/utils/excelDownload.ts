import { getTranslation, ResourceId } from '@esss-swap/duo-localisation';
import XLSX from 'xlsx';

import { ProposalData } from 'hooks/proposal/useProposalsData';

import { absoluteDifference, average, getGrades } from './mathFunctions';

export const excelDownload = (data: ProposalData[]) => {
  const dataColumns = [
    'Proposal ID',
    'Title',
    'Principal Investigator',
    'Technical Status',
    'Tehnical Comment',
    'Time(Days)',
    'Score difference',
    'Average Score',
    'Comment Management',
    'Decision',
    'Order',
  ];
  const dataToExport = data.map(proposalData => [
    proposalData.shortCode,
    proposalData.title,
    `${proposalData.proposer.firstname} ${proposalData.proposer.lastname}`,
    getTranslation(proposalData.technicalReview?.status as ResourceId),
    proposalData.technicalReview?.publicComment,
    proposalData.technicalReview?.timeAllocation,
    absoluteDifference(getGrades(proposalData.reviews)) || 'NA',
    average(getGrades(proposalData.reviews)) || 'NA',
    proposalData.commentForManagement,
    proposalData.finalStatus,
    proposalData.rankOrder,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([dataColumns, ...dataToExport]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
  XLSX.writeFile(wb, 'proposals.xlsx');
};
