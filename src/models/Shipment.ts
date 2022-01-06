export class Shipment {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public proposalPk: number,
    public questionaryId: number,
    public visitId: number,
    public status: ShipmentStatus,
    public externalRef: string,
    public created: Date
  ) {}
}

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}

export const WEIGHT_QID = 'parcel_weight';
export const WIDTH_QID = 'parcel_width';
export const HEIGHT_QID = 'parcel_height';
export const LENGTH_QID = 'parcel_length';

export const STORAGE_TEMPERATURE_QID = 'storage_temperature';
export const IS_FRAGILE_QID = 'is_fragile';
export const LOCAL_CONTACT_QID = 'shipment_local_contact';
export const IS_DANGEROUS_QID = 'is_dangerous';
