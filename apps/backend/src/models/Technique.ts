export class Technique {
  constructor(
    public id: number,
    public name: string,
    public shortCode: string,
    public description: string
  ) {}
}

export class TechniqueHasInstruments {
  constructor(
    public techniqueHasInstrumentIds: number[],
    public techniqueIds: number[],
    public instrumentIds: number[]
  ) {}
}
