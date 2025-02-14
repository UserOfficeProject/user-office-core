import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { UserWithRole } from '../models/User';
import { ExperimentSafety } from '../resolvers/types/ExperimentSafety';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

//todo: This entire file needs to be changed.
@injectable()
export class EsiAuthorization {
  constructor(
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.ProposalEsiDataSource)
    private esiDataSource: ProposalEsiDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
  ) {}

  getScheduledEvent = async (scheduledEventId: number) =>
    await this.scheduledEventDataSource.getScheduledEventCore(scheduledEventId);

  private async resolveEsi(
    esiOrEsiId: ExperimentSafety | number
  ): Promise<ExperimentSafety | null> {
    let esi;

    if (typeof esiOrEsiId === 'number') {
      esi =
        await this.experimentDataSource.getExperimentSafetyByExperimentPk(
          esiOrEsiId
        );
    } else {
      esi = esiOrEsiId;
    }

    return esi;
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
    esi: ExperimentSafety
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    esiOrEsiId: ExperimentSafety | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const esi = await this.resolveEsi(esiOrEsiId);
    if (!esi) {
      return false;
    }
    const experiment = await this.experimentDataSource.getExperiment(
      esi.experimentPk
    );

    if (experiment === null || experiment.proposalPk === null) {
      return false;
    }

    return this.canReadProposal(agent, experiment.proposalPk);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    esi: ExperimentSafety
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    esiOrEsiId: ExperimentSafety | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const esi = await this.resolveEsi(esiOrEsiId);
    if (!esi) {
      return false;
    }
    const experiment = await this.experimentDataSource.getExperiment(
      esi.experimentPk
    );

    if (experiment === null || experiment.proposalPk === null) {
      return false;
    }

    if (
      // esi.isSubmitted === true && //todo: This needs to be taken care
      this.userAuth.isUserOfficer(agent) === false
    ) {
      return false;
    }

    return this.canReadProposal(agent, experiment.proposalPk);
  }
}
