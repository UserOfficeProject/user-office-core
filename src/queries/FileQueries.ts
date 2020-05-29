import { FileDataSource } from '../datasources/IFileDataSource';

export default class FileQueries {
  constructor(private fileDataSource: FileDataSource) {}

  async getFileMetadata(fileIds: string[]) {
    // TODO There should be authentification

    return this.fileDataSource.getMetadata(fileIds);
  }
}
