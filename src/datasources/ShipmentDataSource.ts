import { Shipment } from '../models/Shipment';
import { AddSamplesToShipmentArgs } from '../resolvers/mutations/AddSamplesShipmentMutation';
import { UpdateShipmentArgs } from '../resolvers/mutations/UpdateShipmentMutation';
import { ShipmentsArgs } from '../resolvers/queries/ShipmentsQuery';

export interface ShipmentDataSource {
  create(
    title: string,
    creatorId: number,
    proposalPk: number,
    questionaryId: number,
    scheduledEventId: number
  ): Promise<Shipment>;
  getShipment(shipmentId: number): Promise<Shipment | null>;
  getShipments(args: ShipmentsArgs): Promise<Shipment[]>;
  getShipmentsByCallId(callId: number): Promise<Shipment[]>;
  update(args: UpdateShipmentArgs): Promise<Shipment>;
  addSamples(args: AddSamplesToShipmentArgs): Promise<Shipment>;
  delete(shipmentId: number): Promise<Shipment>;
}
