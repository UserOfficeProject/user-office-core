import { ReadStream } from 'pg-large-object';

import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../FileDataSource';

export default class FileDataSourceMock implements FileDataSource {
  async prepare(fileId: string, _output: string): Promise<string> {
    return fileId;
  }

  async getMetadata(fileIds?: string[]): Promise<FileMetadata[]> {
    if (fileIds) {
      return (
        fileIds?.map(
          (id) => new FileMetadata(id, 1, 'name', 'text/xml', 1, new Date())
        ) ?? []
      );
    }

    return [new FileMetadata('fileId', 1, 'name', 'text/xml', 1, new Date())];
  }

  async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    path: string
  ): Promise<FileMetadata> {
    return new FileMetadata(
      'fileId',
      1,
      fileName,
      mimeType,
      sizeInBytes,
      new Date()
    );
  }

  async putProposalPdf(
    fileName: string,
    mimeType: string,
    stream: NodeJS.ReadableStream,
    proposalPk: number
  ): Promise<FileMetadata> {
    return new FileMetadata('fileId', 1, fileName, mimeType, 1, new Date());
  }

  async getBlobdata(fileName: string): Promise<ReadStream | null> {
    return fileName ? new ReadStream() : null;
  }

  async delete(oid: number): Promise<boolean> {
    return true;
  }
}
