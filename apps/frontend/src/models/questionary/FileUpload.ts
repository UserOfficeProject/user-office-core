export class FileMetaData {
  constructor(
    public fileId: string,
    public originalFileName: string,
    public mimeType: string,
    public sizeInBytes: number,
    public createdDate: Date
  ) {}
}
