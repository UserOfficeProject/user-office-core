import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { GenericTemplateDataSource } from '../../datasources/GenericTemplateDataSource';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { UserWithRole } from '../../models/User';
import { ProposalAuthorization } from '../ProposalAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class GenericTemplateQuestionaryAuthorizer
  implements QuestionaryAuthorizer
{
  private proposalAuth = container.resolve(ProposalAuthorization);

  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.GenericTemplateDataSource)
    private genericTemplateDataSource: GenericTemplateDataSource,
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

    const queryResult =
      await this.genericTemplateDataSource.getGenericTemplates({
        filter: { questionaryIds: [questionaryId] },
      });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one generic template with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const genericTemplate = queryResult[0];

    const proposal = await this.proposalDataSource.get(
      genericTemplate.proposalPk
    );

    if (!proposal) {
      logger.logError(
        'Could not find proposal for generic template questionary',
        {
          questionaryId,
        }
      );

      return false;
    }

    return this.proposalAuth.hasReadRights(agent, proposal);
  }
}
