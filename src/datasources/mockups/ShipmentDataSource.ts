import { Shipment, ShipmentStatus } from '../../models/Shipment';
import { AddSamplesToShipmentArgs } from '../../resolvers/mutations/AddSamplesShipmentMutation';
import { UpdateShipmentArgs } from '../../resolvers/mutations/UpdateShipmentMutation';
import { ShipmentsArgs } from '../../resolvers/queries/ShipmentsQuery';
import { ShipmentDataSource } from '../ShipmentDataSource';

export class ShipmentDataSourceMock implements ShipmentDataSource {
  update(args: UpdateShipmentArgs): Promise<Shipment> {
    throw new Error('Method not implemented.');
  }
  shipments: Shipment[];
  public init() {
    this.shipments = [
      new Shipment(
        1,
        'title',
        1,
        1,
        1,
        ShipmentStatus.DRAFT,
        'abc',
        new Date()
      ),
    ];
  }
  async get(shipmentId: number): Promise<Shipment> {
    return this.shipments.find((shipment) => shipment.id === shipmentId)!;
  }

  async getAll(args: ShipmentsArgs): Promise<Shipment[]> {
    return this.shipments;
  }

  async getShipmentsByCallId(callId: number): Promise<Shipment[]> {
    return this.shipments;
  }

  async create(
    title: string,
    creatorId: number,
    proposalId: number,
    questionaryId: number
  ): Promise<Shipment> {
    return new Shipment(
      1,
      title,
      creatorId,
      proposalId,
      questionaryId,
      ShipmentStatus.DRAFT,
      '',
      new Date()
    );
  }

  async delete(shipmentId: number): Promise<Shipment> {
    return this.shipments.splice(
      this.shipments.findIndex((shipment) => shipment.id == shipmentId),
      1
    )[0];
  }

  async updateShipment(args: UpdateShipmentArgs): Promise<Shipment> {
    const shipment = await this.get(args.shipmentId);
    shipment.title = args.title || shipment.title;
    shipment.status = args.status || shipment.status;

    return shipment;
  }

  async addSamples(args: AddSamplesToShipmentArgs): Promise<Shipment> {
    return this.shipments[0];
  }
}
