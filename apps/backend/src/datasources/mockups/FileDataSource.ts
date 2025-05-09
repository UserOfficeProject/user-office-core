import { ReadStream } from 'pg-large-object';

import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../FileDataSource';
import { FilesMetadataFilter } from './../../resolvers/queries/FilesMetadataQuery';

export default class FileDataSourceMock implements FileDataSource {
  async prepare(fileId: string, _output: string): Promise<string> {
    return fileId;
  }

  async getMetadata(fileId: string): Promise<FileMetadata>;
  async getMetadata(filter: FilesMetadataFilter): Promise<FileMetadata[]>;
  async getMetadata(param: unknown): Promise<FileMetadata | FileMetadata[]> {
    if (param instanceof FilesMetadataFilter) {
      const filter = param as FilesMetadataFilter;

      return Promise.resolve(
        filter.fileIds?.map(
          (id) => new FileMetadata(id, 1, 'name', 'text/xml', 1, new Date())
        ) ?? []
      );
    }

    if (typeof param === 'string') {
      const fileId = param as string;

      return new FileMetadata(fileId, 1, 'name', 'text/xml', 100, new Date());
    }

    throw new Error('Unsupported input for getMetaData');
  }

  async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    filePath: string
  ): Promise<FileMetadata>;
  async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    readStream: NodeJS.ReadableStream
  ): Promise<FileMetadata>;
  async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    source: string | NodeJS.ReadableStream
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

  async getBlobdata(fileName: string): Promise<ReadStream | null> {
    return fileName ? new ReadStream() : null;
  }
}
