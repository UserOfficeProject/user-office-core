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
    public submitted: boolean,
    public fapId: number
  ) {
    super(id, name, shortCode, description, managerUserId);
  }
}

export class InstrumentWithManagementTime extends Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public managerUserId: number,
    public managementTimeAllocation: number
  ) {
    super(id, name, shortCode, description, managerUserId);
  }
}

export class InstrumentsHasProposals {
  constructor(
    public instrumentIds: number[],
    public proposalPks: number[],
    public submitted: boolean
  ) {}
}
