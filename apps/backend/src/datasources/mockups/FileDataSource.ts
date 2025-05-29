import { ReadStream } from 'pg-large-object';

import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../FileDataSource';

export default class FileDataSourceMock implements FileDataSource {
  async prepare(fileId: string, _output: string): Promise<string> {
    return fileId;
  }

  async getMetadata(
    fileIds?: string[],
    filenames?: string[],
    internalUse?: boolean
  ): Promise<FileMetadata[]> {
    if (fileIds || filenames) {
      return Promise.resolve(
        fileIds?.map(
          (id) =>
            new FileMetadata(
              id,
              1,
              'name',
              'text/xml',
              1,
              new Date(),
              internalUse ?? false
            )
        ) ?? []
      );
    }

    if (internalUse != null && internalUse !== undefined) {
      return Promise.resolve([
        new FileMetadata(
          'fileId',
          1,
          'name',
          'text/xml',
          1,
          new Date(),
          internalUse
        ),
      ]);
    }

    return Promise.resolve([]);
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
      new Date(),
      false
    );
  }

  async getBlobdata(
    fileName: string,
    internalUse?: boolean
  ): Promise<ReadStream | null> {
    return fileName ? new ReadStream() : null;
  }

  public async delete(oid: number): Promise<boolean> {
    return Promise.resolve(true);
  }
}
