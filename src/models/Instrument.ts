export class Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public managerUserId: number
  ) {}
}

export class InstrumentWithAvailabilityTime extends Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public managerUserId: number,
    public availabilityTime: number,
    public submitted: boolean
  ) {
    super(id, name, shortCode, description, managerUserId);
  }
}

export class InstrumentHasProposals {
  constructor(
    public instrumentId: number,
    public proposalPks: number[],
    public submitted: boolean
  ) {}
}
