import { logger } from '@user-office-software/duo-logger';
import { container, inject, injectable } from 'tsyringe';

import { SampleAuthorization } from '../auth/SampleAuthorization';
import { ShipmentAuthorization } from '../auth/ShipmentAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { ProposalEndStatus } from '../models/Proposal';
import { rejection } from '../models/Rejection';
import { ShipmentStatus } from '../models/Shipment';
import { TemplateGroupId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { AddSamplesToShipmentArgs } from '../resolvers/mutations/AddSamplesShipmentMutation';
import { CreateShipmentInput } from '../resolvers/mutations/CreateShipmentMutation';
import { SubmitShipmentArgs } from '../resolvers/mutations/SubmitShipmentMutation';
import { UpdateShipmentArgs } from '../resolvers/mutations/UpdateShipmentMutation';
import { AssetRegistrar } from '../services/assetRegistrar/AssetRegistrar';
import { ProposalAuthorization } from './../auth/ProposalAuthorization';

@injectable()
export default class ShipmentMutations {
  private proposalAuth = container.resolve(ProposalAuthorization);
  private sampleAuth = container.resolve(SampleAuthorization);
  private shipmentAuth = container.resolve(ShipmentAuthorization);

  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.AssetRegistrar)
    private assetRegistrarService: AssetRegistrar,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async createShipment(agent: UserWithRole | null, args: CreateShipmentInput) {
    if (!agent) {
      return rejection(
        'Can not create shipment because user is not authorized',
        { args }
      );
    }

    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection(
        'Can not create shipment because proposal was not found',
        { args }
      );
    }

    const templateId = await this.templateDataSource.getActiveTemplateId(
      TemplateGroupId.SHIPMENT
    );

    if (!templateId) {
      return rejection(
        'Can not create shipment because no active template has been set',
        { args, agent }
      );
    }

    const template = await this.templateDataSource.getTemplate(templateId);
    if (template?.groupId !== TemplateGroupId.SHIPMENT) {
      return rejection('Can not create shipment with this template', {
        args,
        agent,
      });
    }

    const canReadProposal = await this.proposalAuth.hasReadRights(
      agent,
      proposal
    );

    if (canReadProposal === false) {
      return rejection(
        'Can not create shipment because of insufficient permissions',
        { args, agent }
      );
    }

    if (
      proposal.finalStatus !== ProposalEndStatus.ACCEPTED ||
      proposal.managementDecisionSubmitted === false
    ) {
      return rejection(
        'Can not create shipment because the proposal is not yet accepted',
        {
          args,
          agent,
        }
      );
    }

    return this.questionaryDataSource
      .create(agent.id, template.templateId)
      .then((questionary) => {
        return this.shipmentDataSource.create(
          args.title,
          agent.id,
          args.proposalPk,
          questionary.questionaryId,
          args.scheduledEventId
        );
      })
      .catch((error) => {
        return rejection('Could not create shipment', { agent, args }, error);
      });
  }

  async submitShipment(agent: UserWithRole | null, args: SubmitShipmentArgs) {
    const hasWriteRights = await this.shipmentAuth.hasWriteRights(
      agent,
      args.shipmentId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not submit shipment because user is not authorized'
      );
    }

    try {
      const assetId = await this.assetRegistrarService.register(
        args.shipmentId
      );

      return this.shipmentDataSource
        .update({
          shipmentId: args.shipmentId,
          status: ShipmentStatus.SUBMITTED,
          externalRef: assetId,
        })
        .then((shipment) => shipment);
    } catch (error) {
      logger.logException(
        'Error occurred while registering asset into EAM',
        error as Error,
        { agent, args }
      );

      return rejection(
        'Could not submit shipment because an error occurred. Please try again later.',
        { args },
        error
      );
    }
  }

  @EventBus(Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED)
  async updateShipment(agent: UserWithRole | null, args: UpdateShipmentArgs) {
    const hasWriteRights = await this.shipmentAuth.hasWriteRights(
      agent,
      args.shipmentId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not update shipment because user is not authorized',
        { args }
      );
    }

    const canAdministerShipment = this.userAuth.isUserOfficer(agent);
    if (canAdministerShipment === false) {
      delete args.status;
      delete args.externalRef;
    }

    return this.shipmentDataSource
      .update(args)
      .then((shipment) => shipment)
      .catch((error) => {
        return rejection('Could not update shipment', { agent, args }, error);
      });
  }

  async deleteShipment(agent: UserWithRole | null, shipmentId: number) {
    const hasWriteRights = await this.shipmentAuth.hasWriteRights(
      agent,
      shipmentId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not delete shipment because user is not authorized',
        { shipmentId }
      );
    }

    return this.shipmentDataSource
      .delete(shipmentId)
      .then((shipment) => shipment)
      .catch((error) => {
        return rejection(
          'Could not delete shipment',
          { agent, shipmentId },
          error
        );
      });
  }

  private isSamplesAuthorized = async (
    agent: UserWithRole | null,
    sampleIds: number[]
  ) => {
    for (const sampleId of sampleIds) {
      const isAuthorized = await this.sampleAuth.hasWriteRights(
        agent,
        sampleId
      );
      if (!isAuthorized) {
        return false;
      }
    }

    return true;
  };

  async addSamples(agent: UserWithRole | null, args: AddSamplesToShipmentArgs) {
    const hasWriteRights = await this.shipmentAuth.hasWriteRights(
      agent,
      args.shipmentId
    );

    if (hasWriteRights === false) {
      return rejection(
        'Can not add samples user does not have permissions to change shipment',
        { args, agent }
      );
    }

    if (!this.isSamplesAuthorized(agent, args.sampleIds)) {
      return rejection(
        'Can not add samples because user does not have permissions to change samples',
        { args, agent }
      );
    }

    // TODO check if samplesIds provided belongs to the proposal

    return this.shipmentDataSource.addSamples(args);
  }
}
