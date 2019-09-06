export class FileMetaData {
    constructor(
        public fid:string,
        public oid:number,
        public originalFileName:string,
        public mimeType:string,
        public sizeInBytes:number,
        public createdDate:Date
    ) {}
}