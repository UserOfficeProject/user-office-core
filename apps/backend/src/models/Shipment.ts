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
export const IS_DANGEROUS_GOODS_KEY = 'is_dangerous_goods';
export const DANGEROUS_GOODS_UN_NUMBER_KEY = 'dangerous_goods_un_number';
export const DANGEROUS_GOODS_DETAILS_KEY = 'dangerous_goods_details';
export const SHIPMENT_SAMPLE_RISKS_KEY = 'shipment_sample_risks';
export const PARCEL_VALUE_KEY = 'parcel_value';
export const SHIPMENT_SENDER_COMPANY_KEY = 'shipment_sender_company';
export const SHIPMENT_SENDER_STREET_ADDRESS_KEY =
  'shipment_sender_street_address';
export const SHIPMENT_SENDER_ZIP_CODE_KEY = 'shipment_sender_zip_code';
export const SHIPMENT_SENDER_CITY_COUNTRY_KEY = 'shipment_sender_city_country';
export const SHIPMENT_SENDER_NAME_KEY = 'shipment_sender_name';
export const SHIPMENT_SENDER_EMAIL_KEY = 'shipment_sender_email';
export const SHIPMENT_SENDER_PHONE_KEY = 'shipment_sender_phone';

export const STORAGE_TEMPERATURE_KEY = 'storage_temperature';
export const LOCAL_CONTACT_KEY = 'shipment_local_contact';
