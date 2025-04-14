import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { UserWithRole } from '../models/User';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class ExperimentSafetyAuthorization {
  constructor(
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
  ) {}

  private async resolveExperimentSafety(
    experimentSafetyOrexperimentSafetyPk: ExperimentSafety | number
  ): Promise<ExperimentSafety | null> {
    let experimentSafety;

    if (typeof experimentSafetyOrexperimentSafetyPk === 'number') {
      experimentSafety = await this.experimentDataSource.getExperimentSafety(
        experimentSafetyOrexperimentSafetyPk
      );
    } else {
      experimentSafety = experimentSafetyOrexperimentSafetyPk;
    }

    return experimentSafety;
  }

  async canReadProposal(
    agent: UserWithRole | null,
    proposalPk: number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    return this.proposalAuth.hasReadRights(agent, proposalPk);
  }

  async hasReadRights(
    agent: UserWithRole | null,
    experimentSafety: ExperimentSafety
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    experimentSafetyOrexperimentSafetyPk: ExperimentSafety | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const experimentSafety = await this.resolveExperimentSafety(
      experimentSafetyOrexperimentSafetyPk
    );
    if (!experimentSafety) {
      return false;
    }
    const experiment = await this.experimentDataSource.getExperiment(
      experimentSafety.experimentPk
    );

    if (experiment === null || experiment.proposalPk === null) {
      return false;
    }

    return this.canReadProposal(agent, experiment.proposalPk);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    experimentSafety: ExperimentSafety
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    experimentSafetyOrexperimentSafetyPk: ExperimentSafety | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }
    const experimentSafety = await this.resolveExperimentSafety(
      experimentSafetyOrexperimentSafetyPk
    );
    if (!experimentSafety) {
      return false;
    }
    const experiment = await this.experimentDataSource.getExperiment(
      experimentSafety.experimentPk
    );
    if (experiment === null || experiment.proposalPk === null) {
      return false;
    }
    if (
      experimentSafety.esiQuestionarySubmittedAt !== null &&
      this.userAuth.isUserOfficer(agent) === false
    ) {
      return false;
    }

    return this.canReadProposal(agent, experiment.proposalPk);
  }
}
