import { Shipment } from '../models/Shipment';
import { AddSamplesToShipmentArgs } from '../resolvers/mutations/AddSamplesShipmentMutation';
import { UpdateShipmentArgs } from '../resolvers/mutations/UpdateShipmentMutation';
import { ShipmentsArgs } from '../resolvers/queries/ShipmentsQuery';

export interface ShipmentDataSource {
  create(
    title: string,
    creatorId: number,
    proposalId: number,
    questionaryId: number
  ): Promise<Shipment>;
  get(shipmentId: number): Promise<Shipment | null>;
  getAll(args: ShipmentsArgs): Promise<Shipment[]>;
  getShipmentsByCallId(callId: number): Promise<Shipment[]>;
  update(args: UpdateShipmentArgs): Promise<Shipment>;
  addSamples(args: AddSamplesToShipmentArgs): Promise<Shipment>;
  delete(shipmentId: number): Promise<Shipment>;
}
