export class FileMetaData {
    constructor(
        public fid:string,
        public originalFileName:string,
        public mimeType:string,
        public sizeInBytes:number,
        public createdDate:Date
    ) {}
}