import { FileMetadata } from '../models/Blob';
import { FilesMetadataFilter } from './../resolvers/queries/FilesMetadataQuery';
export interface FileDataSource {
  prepare(fileId: string, output: string): Promise<string>;
  // Read
  getMetadata(fileId: string): Promise<FileMetadata>;
  getMetadata(filter: FilesMetadataFilter): Promise<FileMetadata[]>;
  // write
  put(
    fileName: string,
    mimeType: string,
    sizeImBytes: number,
    path: string
  ): Promise<FileMetadata>;
}
