import { FileMetadata } from '../models/Blob';
export interface FileDataSource {
  prepare(fileId: string, output: string): Promise<string>;
  // Read
  getMetadata(fileIds: string[]): Promise<FileMetadata[]>;
  // write
  put(
    fileName: string,
    mimeType: string,
    sizeImBytes: number,
    path: string
  ): Promise<FileMetadata>;
}
