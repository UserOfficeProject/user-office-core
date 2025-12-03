import { ReadStream } from 'pg-large-object';

import { FileMetadata } from '../models/Blob';

export interface FileDataSource {
  prepare(fileId: string, output: string): Promise<string>;
  // Read
  getMetadata(fileIds?: string[]): Promise<FileMetadata[]>;
  getBlobdata(fileName: string): Promise<ReadStream | null>;
  // write
  put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    filePath: string
  ): Promise<FileMetadata>;
  putProposalPdf(
    fileName: string,
    mimeType: string,
    stream: NodeJS.ReadableStream,
    proposalPk: number
  ): Promise<FileMetadata>;
  delete(oid: number): Promise<boolean>;
}
