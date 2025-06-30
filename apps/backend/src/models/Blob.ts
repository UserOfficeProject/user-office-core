export class FileMetadata {
  constructor(
    public fileId: string,
    public oid: number,
    public originalFileName: string,
    public mimeType: string,
    public sizeInBytes: number,
    public createdDate: Date
  ) {}
}
