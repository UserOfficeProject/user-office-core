import { ReadStream } from 'pg-large-object';

import { FileMetadata } from '../models/Blob';

export interface FileDataSource {
  prepare(fileId: string, output: string): Promise<string>;
  // Read
  getMetadata(
    fileIds?: string[],
    filenames?: string[],
    internalUse?: boolean
  ): Promise<FileMetadata[]>;
  getBlobdata(
    fileName: string,
    internalUse?: boolean
  ): Promise<ReadStream | null>;
  // write
  put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    filePath: string,
    internalUse?: boolean
  ): Promise<FileMetadata>;
  put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number | undefined,
    readStream: NodeJS.ReadableStream,
    internalUse?: boolean
  ): Promise<FileMetadata>;
  delete(oid: number): Promise<boolean>;
}
