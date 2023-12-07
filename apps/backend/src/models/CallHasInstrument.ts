export class CallHasInstrument {
  constructor(
    public callId: number,
    public instrumentId: number,
    public availabilityTime: number,
    public submitted: boolean,
    public fapId: number | null
  ) {}
}
