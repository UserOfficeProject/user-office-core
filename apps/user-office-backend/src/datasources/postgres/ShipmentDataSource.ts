import { logger } from '@user-office-software/duo-logger';

import { Shipment } from '../../models/Shipment';
import { AddSamplesToShipmentArgs } from '../../resolvers/mutations/AddSamplesShipmentMutation';
import { UpdateShipmentArgs } from '../../resolvers/mutations/UpdateShipmentMutation';
import { ShipmentsArgs } from '../../resolvers/queries/ShipmentsQuery';
import { ShipmentDataSource } from '../ShipmentDataSource';
import database from './database';
import { createShipmentObject, ShipmentRecord } from './records';

export default class PostgresShipmentDataSource implements ShipmentDataSource {
  async create(
    title: string,
    creator_id: number,
    proposal_pk: number,
    questionary_id: number,
    scheduled_event_id: number
  ): Promise<Shipment> {
    return database('shipments')
      .insert(
        { title, creator_id, proposal_pk, questionary_id, scheduled_event_id },
        '*'
      )
      .then((records: ShipmentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not create shipment', {
            title,
            creator_id,
            proposal_pk,
            questionary_id,
            scheduled_event_id,
          });
          throw new Error('Failed to insert shipment');
        }

        return createShipmentObject(records[0]);
      });
  }

  async getShipment(shipmentId: number): Promise<Shipment | null> {
    return database('shipments')
      .select('*')
      .where('shipment_id', shipmentId)
      .then((records: ShipmentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Shipment does not exist', { shipmentId });

          return null;
        }

        return createShipmentObject(records[0]);
      });
  }

  async getShipments(args: ShipmentsArgs): Promise<Shipment[]> {
    const filter = args.filter;

    return database('shipments')
      .modify((query) => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.status) {
          query.where('creator_id', filter.status);
        }
        if (filter?.questionaryIds) {
          query.where('questionary_id', 'in', filter.questionaryIds);
        }
        if (filter?.title) {
          query.where('title', 'like', `%${filter.title}%`);
        }
        if (filter?.shipmentIds) {
          query.where('shipment_id', 'in', filter.shipmentIds);
        }
        if (filter?.proposalPk) {
          query.where('proposal_pk', filter.proposalPk);
        }
        if (filter?.externalRef) {
          query.where('external_ref', filter.externalRef);
        }
        if (filter?.scheduledEventId) {
          query.where('scheduled_event_id', filter.scheduledEventId);
        }
      })
      .select('*')
      .then((records: ShipmentRecord[]) =>
        records.map((record) => createShipmentObject(record))
      );
  }

  async getShipmentsByCallId(callId: number): Promise<Shipment[]> {
    return database('proposals')
      .leftJoin('shipments', 'proposals.proposal_pk', 'shipments.proposal_pk')
      .where({
        'proposals.call_id': callId,
      })
      .then((shipments: ShipmentRecord[]) => {
        return shipments.map((shipment) => createShipmentObject(shipment));
      });
  }

  async update(args: UpdateShipmentArgs): Promise<Shipment> {
    return database('shipments')
      .update(
        {
          title: args.title,
          status: args.status,
          proposal_pk: args.proposalPk,
          external_ref: args.externalRef,
        },
        '*'
      )
      .where({ shipment_id: args.shipmentId })
      .then((records: ShipmentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not update shipment', { args });
          throw new Error('Could not update shipment');
        }

        return createShipmentObject(records[0]);
      });
  }

  async delete(shipmentId: number): Promise<Shipment> {
    return database('shipments')
      .where({ shipment_id: shipmentId })
      .delete('*')
      .then((records: ShipmentRecord[]) => {
        if (records.length !== 1) {
          logger.logError('Could not delete shipment', { shipmentId });
          throw new Error('Could not delete shipment');
        }

        return createShipmentObject(records[0]);
      });
  }

  async addSamples({
    shipmentId,
    sampleIds,
  }: AddSamplesToShipmentArgs): Promise<Shipment> {
    const shipment = await this.getShipment(shipmentId);

    if (!shipment) {
      logger.logError('Shipment does not exist', { shipmentId, sampleIds });
      throw new Error('Shipment does not exist');
    }

    await database('shipments_has_samples')
      .where({ shipment_id: shipmentId })
      .delete('*');

    await database('shipments_has_samples').insert(
      sampleIds.map((sampleId) => ({
        shipment_id: shipmentId,
        sample_id: sampleId,
      }))
    );

    return shipment;
  }
}
