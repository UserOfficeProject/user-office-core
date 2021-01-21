export class Feature {
  constructor(
    public id: FeatureId,
    public isEnabled: boolean,
    public description: string
  ) {}
}

export enum FeatureId {
  SHIPPING = 'SHIPPING',
}
