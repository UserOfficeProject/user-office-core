export default class User {
  id: number;
  shortCode: string;
  title: string;

  constructor(id: number, shortCode: string, title: string) {
    this.id = id;
    this.shortCode = shortCode;
    this.title = title;
  }
}
