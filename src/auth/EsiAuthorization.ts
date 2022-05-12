import { container, inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalEsiDataSource } from '../datasources/ProposalEsiDataSource';
import { ScheduledEventDataSource } from '../datasources/ScheduledEventDataSource';
import { UserWithRole } from '../models/User';
import { ExperimentSafetyInput } from './../resolvers/types/ExperimentSafetyInput';
import { ProposalAuthorization } from './ProposalAuthorization';
import { UserAuthorization } from './UserAuthorization';

@injectable()
export class EsiAuthorization {
  private proposalAuth = container.resolve(ProposalAuthorization);
  constructor(
    @inject(Tokens.ScheduledEventDataSource)
    private scheduledEventDataSource: ScheduledEventDataSource,
    @inject(Tokens.ProposalEsiDataSource)
    private esiDataSource: ProposalEsiDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  getScheduledEvent = async (scheduledEventId: number) =>
    await this.scheduledEventDataSource.getScheduledEventCore(scheduledEventId);

  private async resolveEsi(
    esiOrEsiId: ExperimentSafetyInput | number
  ): Promise<ExperimentSafetyInput | null> {
    let esi;

    if (typeof esiOrEsiId === 'number') {
      esi = await this.esiDataSource.getEsi(esiOrEsiId);
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
    esi: ExperimentSafetyInput
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasReadRights(
    agent: UserWithRole | null,
    esiOrEsiId: ExperimentSafetyInput | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const esi = await this.resolveEsi(esiOrEsiId);
    if (!esi) {
      return false;
    }
    const scheduledEvent = await this.getScheduledEvent(esi.scheduledEventId);

    if (scheduledEvent === null || scheduledEvent.proposalPk === null) {
      return false;
    }

    return this.canReadProposal(agent, scheduledEvent.proposalPk);
  }

  async hasWriteRights(
    agent: UserWithRole | null,
    esi: ExperimentSafetyInput
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    esiId: number
  ): Promise<boolean>;
  async hasWriteRights(
    agent: UserWithRole | null,
    esiOrEsiId: ExperimentSafetyInput | number
  ): Promise<boolean> {
    if (!agent) {
      return false;
    }

    const esi = await this.resolveEsi(esiOrEsiId);
    if (!esi) {
      return false;
    }
    const scheduledEvent = await this.getScheduledEvent(esi.scheduledEventId);

    if (scheduledEvent === null || scheduledEvent.proposalPk === null) {
      return false;
    }

    if (
      esi.isSubmitted === true &&
      this.userAuth.isUserOfficer(agent) === false
    ) {
      return false;
    }

    return this.canReadProposal(agent, scheduledEvent.proposalPk);
  }
}
