export class Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public managerUserId: number,
    public selectable?: boolean,
    public multipleTechReviewsEnabled?: boolean
  ) {}
}

export class InstrumentWithAvailabilityTime extends Instrument {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public managerUserId: number,
    public availabilityTime: number | null,
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
    public managementTimeAllocation: number,
    public multipleTechReviewsEnabled?: boolean
  ) {
    super(
      id,
      name,
      shortCode,
      description,
      managerUserId,
      multipleTechReviewsEnabled
    );
  }
}

export class InstrumentsHasProposals {
  constructor(
    public instrumentHasProposalIds: number[],
    public instrumentIds: number[],
    public proposalPks: number[],
    public submitted: boolean
  ) {}
}
