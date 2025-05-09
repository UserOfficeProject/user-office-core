import { ReadStream } from 'pg-large-object';

import { FileMetadata } from '../models/Blob';
import { FilesMetadataFilter } from '../resolvers/queries/FilesMetadataQuery';
export interface FileDataSource {
  prepare(fileId: string, output: string): Promise<string>;
  // Read
  getMetadata(fileId: string): Promise<FileMetadata>;
  getMetadata(filter: FilesMetadataFilter): Promise<FileMetadata[]>;
  getBlobdata(fileName: string): Promise<ReadStream | null>;
  // write
  put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    filePath: string
  ): Promise<FileMetadata>;
  put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    readStream: NodeJS.ReadableStream
  ): Promise<FileMetadata>;
}
