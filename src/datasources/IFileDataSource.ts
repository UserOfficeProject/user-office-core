import {FileMetadata} from '../models/Blob'
export interface IFileDataSource {
  prepare(fileId: string, output:string): Promise<void>;
  // Read
  getMetadata(fileIds: string[]): Promise<FileMetadata[]>
  // write
  put(fileName:string, mimeType:string, sizeImBytes:number, path: string): Promise<FileMetadata | null> 
}
