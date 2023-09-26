import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { SampleDataSource } from '../../datasources/SampleDataSource';
import { UserWithRole } from '../../models/User';
import { ProposalAuthorization } from '../ProposalAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class SampleDeclarationQuestionaryAuthorizer
  implements QuestionaryAuthorizer
{
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.SampleDataSource)
    private sampleDataSource: SampleDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    return this.hasRights(agent, questionaryId);
  }

  private async hasRights(agent: UserWithRole | null, questionaryId: number) {
    if (!agent) {
      return false;
    }

    if (this.userAuth.isUserOfficer(agent)) {
      return true;
    }

    const queryResult = await this.sampleDataSource.getSamples({
      filter: { questionaryIds: [questionaryId] },
    });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one sample with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const sample = queryResult[0];

    const proposal = await this.proposalDataSource.get(sample.proposalPk);

    if (!proposal) {
      logger.logError('Could not find proposal for sample questionary', {
        questionaryId,
      });

      return false;
    }

    return this.proposalAuth.hasReadRights(agent, proposal);
  }
}
