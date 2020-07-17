export class Sample {
  constructor(
    public id: number,
    public title: string,
    public creatorId: number,
    public questionaryId: number,
    public status: SampleStatus,
    public created: Date
  ) {}
}

export enum SampleStatus {
  NONE = 0,
  SAFE,
  UNSAFE,
}
