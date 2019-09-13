export class FileMetaData {
    constructor(
        public file_id:string,
        public oid:number,
        public originalFileName:string,
        public mimeType:string,
        public sizeInBytes:number,
        public createdDate:Date
    ) {}
}