import { UserAuthorization } from "../utils/UserAuthorization";

import { EventBus } from "../events/eventBus";

import { ApplicationEvent } from "../events/applicationEvents";
import { IFileDataSource } from "../datasources/IFileDataSource";
import { FileMetadata } from "../models/Blob";
import { Rejection, rejection } from "../rejection";
import { logger } from "../utils/Logger";

export default class FileMutations {
  constructor(
    private dataSource: IFileDataSource,
    private userAuth: UserAuthorization,
    private eventBus: EventBus<ApplicationEvent>
  ) {}

  async put(
    fileName: string,
    mimeType: string,
    sizeImBytes: number,
    path: string
  ): Promise<FileMetadata | Rejection> {
    return this.dataSource
      .put(fileName, mimeType, sizeImBytes, path)
      .then(metadata => metadata)
      .catch(err => {
        logger.logException("Could not save file", err, { fileName, path });
        return rejection("INTERNAL_ERROR");
      });
  }

  async prepare(fileId: string): Promise<string | Rejection> {
    const filePath = `downloads/${fileId}`;
    return this.dataSource
      .prepare(fileId, filePath)
      .then(fid => filePath)
      .catch(err => {
        logger.logException("Could not prepare file", err, { fileId });
        return rejection("INTERNAL_ERROR");
      });
  }
}
