export class Institution {
  constructor(
    public id: number,
    public name: string,
    public country: number,
    public rorId?: string
  ) {}
}
