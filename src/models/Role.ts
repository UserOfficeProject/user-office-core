export class Role {
  id: number;
  shortCode: string;
  title: string;

  constructor(id: number, shortCode: string, title: string) {
    this.id = id;
    this.shortCode = shortCode;
    this.title = title;
  }
}
