import { logger } from '@esss-swap/duo-logger';

import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { ShipmentDataSource } from '../datasources/ShipmentDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized, EventBus } from '../decorators';
import { Event } from '../events/event.enum';
import { ShipmentStatus } from '../models/Shipment';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { rejection } from '../rejection';
import { AddSamplesToShipmentArgs } from '../resolvers/mutations/AddSamplesShipmentMutation';
import { CreateShipmentInput } from '../resolvers/mutations/CreateShipmentMutation';
import { UpdateShipmentArgs } from '../resolvers/mutations/UpdateShipmentMutation';
import { SampleAuthorization } from '../utils/SampleAuthorization';
import { ShipmentAuthorization } from '../utils/ShipmentAuthorization';
import { userAuthorization } from '../utils/UserAuthorization';

export default class ShipmentMutations {
  constructor(
    private shipmentDataSource: ShipmentDataSource,
    private questionaryDataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private proposalDataSource: ProposalDataSource,
    private sampleAuthorization: SampleAuthorization,
    private shipmentAuthorization: ShipmentAuthorization
  ) {}

  @Authorized()
  async createShipment(agent: UserWithRole | null, args: CreateShipmentInput) {
    if (!agent) {
      return rejection('NOT_AUTHORIZED');
    }

    const proposal = await this.proposalDataSource.get(args.proposalId);
    if (!proposal) {
      return rejection('NOT_FOUND');
    }

    const templateId = await this.templateDataSource.getActiveTemplateId(
      TemplateCategoryId.SHIPMENT_DECLARATION
    );

    if (!templateId) {
      logger.logError('Cant create shipment, no active template has been set', {
        args,
        agent,
      });

      return rejection('INTERNAL_ERROR');
    }

    const template = await this.templateDataSource.getTemplate(templateId);
    if (template?.categoryId !== TemplateCategoryId.SHIPMENT_DECLARATION) {
      logger.logError('Cant create shipment with this template', {
        args,
        agent,
      });

      return rejection('INTERNAL_ERROR');
    }

    if ((await userAuthorization.hasAccessRights(agent, proposal)) === false) {
      return rejection('NOT_ALLOWED');
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
        logger.logException('Could not create shipment', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  @EventBus(Event.PROPOSAL_SAMPLE_REVIEW_SUBMITTED)
  async updateShipment(agent: UserWithRole | null, args: UpdateShipmentArgs) {
    if (!this.shipmentAuthorization.hasWriteRights(agent, args.shipmentId)) {
      return rejection('NOT_AUTHORIZED');
    }

    // TODO makes sure administrative fields can be only updated by user with the right role
    if (args.status === ShipmentStatus.DRAFT) {
      const canAdministrerShipment = await userAuthorization.isUserOfficer(
        agent
      );
      if (canAdministrerShipment === false) {
        delete args.status;
      }
    }

    return this.shipmentDataSource
      .update(args)
      .then((shipment) => shipment)
      .catch((error) => {
        logger.logException('Could not update shipment', error, {
          agent,
          args,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  async deleteShipment(agent: UserWithRole | null, shipmentId: number) {
    if (!this.shipmentAuthorization.hasWriteRights(agent, shipmentId)) {
      return rejection('NOT_AUTHORIZED');
    }

    return this.shipmentDataSource
      .delete(shipmentId)
      .then((shipment) => shipment)
      .catch((error) => {
        logger.logException('Could not delete shipment', error, {
          agent,
          shipmentId,
        });

        return rejection('INTERNAL_ERROR');
      });
  }

  private isSamplesAuthorized = async (
    agent: UserWithRole | null,
    sampleIds: number[]
  ) => {
    for (const sampleId of sampleIds) {
      const isAuthorized = await this.sampleAuthorization.hasWriteRights(
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
    if (!this.shipmentAuthorization.hasWriteRights(agent, args.shipmentId)) {
      return rejection('NOT_AUTHORIZED');
    }
    if (!this.isSamplesAuthorized(agent, args.sampleIds)) {
      return rejection('NOT_AUTHORIZED');
    }

    // TODO check if samplesIds provided belongs to the proposal

    return this.shipmentDataSource.addSamples(args);
  }
}
