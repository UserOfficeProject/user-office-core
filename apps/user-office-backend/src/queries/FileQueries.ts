import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FileDataSource } from '../datasources/IFileDataSource';

@injectable()
export default class FileQueries {
  constructor(
    @inject(Tokens.FileDataSource) private dataSource: FileDataSource
  ) {}

  async getFileMetadata(fileIds: string[]) {
    // TODO There should be authentification

    return this.dataSource.getMetadata(fileIds);
  }
}
