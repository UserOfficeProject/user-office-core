export class Technique {
  constructor(
    public techniqueId: number,
    public name: string,
    public shortCode: string,
    public description: string
  ) {}
}

export class TechniqueHasInstruments {
  constructor(
    public techniqueId: number,
    public instrumentId: number
  ) {}
}
