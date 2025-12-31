import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';

export const isProposalSubmittedGuard = async (proposalPk: number) => {
  const proposalDataSource = container.resolve<ProposalDataSource>(
    Tokens.ProposalDataSource
  );

  const proposal = await proposalDataSource.get(proposalPk);

  return proposal?.submitted === true;
};
