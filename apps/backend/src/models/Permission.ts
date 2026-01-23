export class Permission {
  constructor(
    public id: number,
    public role: string,
    public object: string,
    public action: string,
    public call: string,
    public instrument_ids: string[],
    public facility: string,
    public instrument_operator: string,
    public custom_filter: string
  ) {}
}
