import { existsSync, mkdirSync } from 'fs';

import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FileDataSource } from '../datasources/IFileDataSource';
import { FileMetadata } from '../models/Blob';
import { Rejection, rejection } from '../models/Rejection';
@injectable()
export default class FileMutations {
  constructor(
    @inject(Tokens.FileDataSource) private dataSource: FileDataSource
  ) {}

  async put(
    fileName: string,
    mimeType: string,
    sizeImBytes: number,
    path: string
  ): Promise<FileMetadata | Rejection> {
    return this.dataSource
      .put(fileName, mimeType, sizeImBytes, path)
      .then((metadata) => metadata)
      .catch((err) => {
        return rejection('Could not save file', { fileName, path }, err);
      });
  }

  async prepare(fileId: string): Promise<string | Rejection> {
    const DOWNLOADS_DIR = 'downloads';
    if (!existsSync(DOWNLOADS_DIR)) {
      mkdirSync(DOWNLOADS_DIR);
    }
    const filePath = `${DOWNLOADS_DIR}/${fileId}`;

    return this.dataSource
      .prepare(fileId, filePath)
      .then(() => filePath)
      .catch((err) => {
        return rejection('Could not prepare file', { fileId }, err);
      });
  }
}
