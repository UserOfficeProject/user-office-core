export class Instrument {
  constructor(
    public instrumentId: number,
    public name: string,
    public shortCode: string,
    public description: string
  ) {}
}

export class InstrumentWithAvailabilityTime extends Instrument {
  constructor(
    public instrumentId: number,
    public name: string,
    public shortCode: string,
    public description: string,
    public availabilityTime: number
  ) {
    super(instrumentId, name, shortCode, description);
  }
}
