import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../IFileDataSource';

export default class FileDataSourceMock implements FileDataSource {
  async prepare(fileId: string, _output: string): Promise<string> {
    return fileId;
  }
  async getMetadata(fileIds: string[]): Promise<FileMetadata[]> {
    return fileIds.map(
      (fileId, index) =>
        new FileMetadata(fileId, index, '', 'text/xml', 100, new Date())
    );
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
