export class Shipment {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public proposalPk: number,
    public questionaryId: number,
    public scheduledEventId: number,
    public status: ShipmentStatus,
    public externalRef: string,
    public created: Date
  ) {}
}

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

export const WEIGHT_KEY = 'parcel_weight';
export const WIDTH_KEY = 'parcel_width';
export const HEIGHT_KEY = 'parcel_height';
export const LENGTH_KEY = 'parcel_length';

export const STORAGE_TEMPERATURE_KEY = 'storage_temperature';
export const IS_FRAGILE_KEY = 'is_fragile';
export const LOCAL_CONTACT_KEY = 'shipment_local_contact';
export const IS_DANGEROUS_KEY = 'is_dangerous';
