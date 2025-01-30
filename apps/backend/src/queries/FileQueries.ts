import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FileDataSource } from '../datasources/FileDataSource';
import { FilesMetadataFilter } from '../resolvers/queries/FilesMetadataQuery';

@injectable()
export default class FileQueries {
  constructor(
    @inject(Tokens.FileDataSource) private dataSource: FileDataSource
  ) {}

  async getFileMetadata(fileId: string) {
    // TODO There should be authentication

    return this.dataSource.getMetadata(fileId);
  }

  async getFilesMetadata(filter: FilesMetadataFilter) {
    // TODO There should be authentication

    return this.dataSource.getMetadata(filter);
  }
}
