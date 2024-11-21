import {
  getTranslation,
  ResourceId,
} from '@user-office-software/duo-localisation';

import baseContext from '../../buildContext';
import { ProposalEndStatus } from '../../models/Proposal';
import { TechnicalReviewStatus } from '../../models/TechnicalReview';
import { UserWithRole } from '../../models/User';

type ProposalXLSData = Array<string | number>;

export const defaultProposalDataColumns = [
  'Proposal ID',
  'Title',
  'Principal Investigator',
  'Instrument',
  'Technical Status',
  'Technical Comment',
  'Time(Days)',
  'Comment Management',
  'Decision',
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

  const technicalReviews =
    await baseContext.queries.technicalReview.reviewsForProposal(
      user,
      proposal.primaryKey
    );

  const instruments =
    await baseContext.queries.instrument.getInstrumentsByProposalPk(
      user,
      proposal.primaryKey
    );

  return [
    proposal.proposalId,
    proposal.title,
    `${proposer.firstname} ${proposer.lastname}`,
    instruments.length
      ? instruments
          .map((instrument) => instrument.name ?? '<missing>')
          .join(', ')
      : '<missing>',
    technicalReviews.length
      ? technicalReviews
          .map((technicalReview) =>
            technicalReview?.status !== undefined &&
            technicalReview?.status !== null
              ? getTranslation(
                  TechnicalReviewStatus[technicalReview?.status] as ResourceId
                )
              : '<missing>'
          )
          .join(', ')
      : '<missing>',
    technicalReviews
      ?.map((technicalReview) => technicalReview?.publicComment || '<missing>')
      .join(', ') || '<missing>',
    technicalReviews
      ?.map((technicalReview) => technicalReview?.timeAllocation ?? '<missing>')
      .join(', ') ?? '<missing>',
    proposal.commentForManagement || '<missing>',
    ProposalEndStatus[proposal.finalStatus] ?? '<missing>',
  ];
};

export const collectTechniqueProposalXLSXData = async (
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

  const instruments =
    await baseContext.queries.instrument.getInstrumentsByProposalPk(
      user,
      proposal.primaryKey
    );

  const techniques =
    await baseContext.queries.technique.getTechniquesByProposalPk(
      user,
      proposal.primaryKey
    );

  const submittedDate = proposal.submittedDate
    ? proposal.submittedDate.toLocaleString()
    : '';

  const status = await baseContext.queries.proposalSettings.getProposalStatus(
    user,
    proposal.statusId
  );

  return [
    proposal.proposalId,
    proposal.title,
    `${proposer.firstname} ${proposer.lastname}`,
    proposer.email,
    submittedDate,
    techniques.length
      ? techniques.map((technique) => technique.name ?? '').join(', ')
      : '',
    instruments.length
      ? instruments.map((instrument) => instrument.name ?? '').join(', ')
      : '',
    status?.name ?? '',
  ];
};
