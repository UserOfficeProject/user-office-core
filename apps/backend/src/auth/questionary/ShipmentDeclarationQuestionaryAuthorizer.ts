import { logger } from '@user-office-software/duo-logger';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalDataSource } from '../../datasources/ProposalDataSource';
import { ShipmentDataSource } from '../../datasources/ShipmentDataSource';
import { UserWithRole } from '../../models/User';
import { ProposalAuthorization } from '../ProposalAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';
import { UserAuthorization } from '../UserAuthorization';

@injectable()
export class ShipmentDeclarationQuestionaryAuthorizer
  implements QuestionaryAuthorizer
{
  constructor(
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization
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

    const queryResult = await this.shipmentDataSource.getShipments({
      filter: { questionaryIds: [questionaryId] },
    });

    if (queryResult.length !== 1) {
      logger.logError(
        'Expected to find exactly one sample with questionaryId',
        { questionaryId }
      );

      return false;
    }

    const shipment = queryResult[0];

    const proposal = await this.proposalDataSource.get(shipment.proposalPk);

    if (!proposal) {
      logger.logError('Could not find proposal for shipment questionary', {
        questionaryId,
      });

      return false;
    }

    return this.proposalAuth.hasReadRights(agent, proposal);
  }
}
