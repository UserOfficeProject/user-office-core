export class Shipment {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public proposalId: number,
    public questionaryId: number,
    public status: ShipmentStatus,
    public externalRef: string,
    public created: Date
  ) {}
}

export enum ShipmentStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
}
