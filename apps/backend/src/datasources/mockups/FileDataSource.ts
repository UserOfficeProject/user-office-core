import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../IFileDataSource';
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
    sizeImBytes: number,
    _path: string
  ): Promise<FileMetadata> {
    return new FileMetadata(
      'fileId',
      1,
      fileName,
      mimeType,
      sizeImBytes,
      new Date()
    );
  }
}
