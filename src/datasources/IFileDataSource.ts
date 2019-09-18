import {FileMetaData} from '../models/Blob'
export interface IFileDataSource {
  prepare(fileId: string, output:string): Promise<void>;
  // Read
  getMetaData(id: string): Promise<FileMetaData | null>
  // write
  put(fileName:string, mimeType:string, sizeImBytes:number, path: string): Promise<FileMetaData | null> 
}
