import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { ProposalEsiDataSource } from '../../datasources/ProposalEsiDataSource';
import { UserWithRole } from '../../models/User';
import { EsiAuthorization } from '../EsiAuthorization';
import { QuestionaryAuthorizer } from '../QuestionaryAuthorization';

@injectable()
export class ProposalEsiQuestionaryAuthorizer implements QuestionaryAuthorizer {
  private esiAuth = container.resolve(EsiAuthorization);

  constructor(
    @inject(Tokens.ProposalEsiDataSource)
    private proposalEsiDataSource: ProposalEsiDataSource
  ) {}

  async getEsiId(esiQuestionaryId: number): Promise<number | null> {
    const esi = await this.proposalEsiDataSource.getEsis({
      questionaryId: esiQuestionaryId,
    });
    if (esi.length !== 1) {
      return null;
    }

    return esi[0].id;
  }
  async hasReadRights(agent: UserWithRole | null, questionaryId: number) {
    const esiId = await this.getEsiId(questionaryId);
    if (esiId === null) {
      return false;
    }

    return this.esiAuth.hasReadRights(agent, esiId);
  }
  async hasWriteRights(agent: UserWithRole | null, questionaryId: number) {
    const esiId = await this.getEsiId(questionaryId);
    if (esiId === null) {
      return false;
    }

    return this.esiAuth.hasWriteRights(agent, esiId);
  }
}
