import { container } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { IGuard } from './IGuard';

export class IsProposalSubmittedGuard implements IGuard {
  private isProposalSubmitted!: boolean;

  public async initialize(proposalPk: number) {
    const proposalDataSource = container.resolve<ProposalDataSource>(
      Tokens.ProposalDataSource
    );

    const proposal = await proposalDataSource.get(proposalPk);

    this.isProposalSubmitted = proposal ? proposal.submitted : false;
  }

  public get name(): string {
    return 'isProposalSubmittedGuard';
  }

  public guard(): boolean {
    return this.isProposalSubmitted;
  }
}
