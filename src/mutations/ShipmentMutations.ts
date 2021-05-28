import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { rejection } from '../models/Rejection';
import { ShipmentStatus } from '../models/Shipment';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { AddSamplesToShipmentArgs } from '../resolvers/mutations/AddSamplesShipmentMutation';
import { CreateShipmentInput } from '../resolvers/mutations/CreateShipmentMutation';
import { SubmitShipmentArgs } from '../resolvers/mutations/SubmitShipmentMutation';
import { UpdateShipmentArgs } from '../resolvers/mutations/UpdateShipmentMutation';
import { AssetRegistrar } from '../utils/EAM_service';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import { UserAuthorization } from '../utils/UserAuthorization';
@injectable()
export default class ShipmentMutations {
  constructor(
    @inject(Tokens.ShipmentDataSource)
    private shipmentDataSource: ShipmentDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.SampleAuthorization)
    private sampleAuth: SampleAuthorization,
    @inject(Tokens.ShipmentAuthorization)
    private shipmentAuth: ShipmentAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization,
    @inject(Tokens.AssetRegistrar)
    private assetRegistrarService: AssetRegistrar
  ) {}

  @Authorized()
  async createShipment(agent: UserWithRole | null, args: CreateShipmentInput) {
    if (!agent) {
      return rejection(
        'Can not create shipment because user is not authorized',
        { args }
      );
    }

    const proposal = await this.proposalDataSource.get(args.proposalId);
    if (!proposal) {
      return rejection(
        'Can not create shipment because proposal was not found',
        { args }
      );
    }

    const templateId = await this.templateDataSource.getActiveTemplateId(
      TemplateCategoryId.SHIPMENT_DECLARATION
    );

    if (!templateId) {
      return rejection(
        'Can not create shipment because no active template has been set',
        { args, agent }
      );
    }

    const template = await this.templateDataSource.getTemplate(templateId);
    if (template?.categoryId !== TemplateCategoryId.SHIPMENT_DECLARATION) {
      return rejection('Can not create shipment with this template', {
        args,
        agent,
      });
    }

    if ((await this.userAuth.hasAccessRights(agent, proposal)) === false) {
      return rejection(
        'Can not create shipment because of insufficient permissions',
        { args, agent }
      );
    }

    return this.questionaryDataSource
      .create(agent.id, template.templateId)
      .then((questionary) => {
        return this.shipmentDataSource.create(
          args.title,
          agent.id,
          args.proposalId,
          questionary.questionaryId
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
      const assetId = await this.assetRegistrarService.register();

      return this.shipmentDataSource
        .update({
          shipmentId: args.shipmentId,
          status: ShipmentStatus.SUBMITTED,
          externalRef: assetId,
        })
        .then((shipment) => shipment);
    } catch (error) {
      return rejection(
        'Could not submit shipment because an error occurred',
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
