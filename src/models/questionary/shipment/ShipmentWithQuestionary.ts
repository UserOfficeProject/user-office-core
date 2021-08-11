import { GetShipmentQuery } from 'generated/sdk';

export type ShipmentWithQuestionary = Exclude<
  GetShipmentQuery['shipment'],
  null
>;
