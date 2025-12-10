export class Institution {
  constructor(
    public id: number,
    public name: string,
    public country: number | null,
    public rorId?: string
  ) {}
}
