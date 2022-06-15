import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';

import baseContext from '../../buildContext';
import { ProposalEndStatus } from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { UserWithRole } from '../../models/User';
import {
  absoluteDifference,
  average,
  getGrades,
} from '../../utils/mathFunctions';

type ProposalXLSData = Array<string | number>;

export const defaultProposalDataColumns = [
  'Proposal ID',
  'Title',
  'Principal Investigator',
  'Technical Status',
  'Technical Comment',
  'Time(Days)',
  'Score difference',
  'Average Score',
  'Comment Management',
  'Decision',
  'Order',
];

// Note: to optimize, we could create a query to collect everything
// but this may be more flexible than using queries?
export const collectProposalXLSXData = async (
  proposalPk: number,
  user: UserWithRole,
  notify?: CallableFunction
): Promise<ProposalXLSData> => {
  const proposal = await baseContext.queries.proposal.get(user, proposalPk);

  if (!proposal) {
    throw new Error(
      `Proposal with ID '${proposalPk}' not found, or the user has insufficient rights`
    );
  }

  notify?.(
    `proposal_${proposal.created.getUTCFullYear()}_${proposal.proposalId}.xlsx`
  );

  const proposer = await baseContext.queries.user.get(
    user,
    proposal.proposerId
  );

  if (!proposer) {
    throw new Error(
      `Proposer with ID '${proposal.proposerId}' not found, or the user has insufficient rights`
    );
  }

  const technicalReview =
    await baseContext.queries.review.technicalReviewForProposal(
      user,
      proposal.primaryKey
    );

  const reviews = await baseContext.queries.review.reviewsForProposal(
    user,
    proposalPk
  );

  const sepMeetingDecision =
    await baseContext.queries.sep.getProposalSepMeetingDecision(
      user,
      proposal.primaryKey
    );

  return [
    proposal.proposalId,
    proposal.title,
    `${proposer.firstname} ${proposer.lastname}`,
    technicalReview?.status !== undefined && technicalReview?.status !== null
      ? getTranslation(
          TechnicalReviewStatus[technicalReview?.status] as ResourceId
        )
      : '<missing>',
    technicalReview?.publicComment ?? '<missing>',
    technicalReview?.timeAllocation ?? '<missing>',
    absoluteDifference(getGrades(reviews)) || 'NA',
    average(getGrades(reviews)) || 'NA',
    proposal.commentForManagement ?? '<missing>',
    ProposalEndStatus[proposal.finalStatus] ?? '<missing>',
    sepMeetingDecision?.rankOrder ?? '<missing>',
  ];
};
