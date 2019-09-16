import { UserAuthorization } from "../utils/UserAuthorization";

import { EventBus } from "../events/eventBus";

import { ApplicationEvent } from "../events/applicationEvents";
import { IFileDataSource } from "../datasources/IFileDataSource";
import { FileMetaData } from "../models/Blob";

export default class FileMutations {
    constructor(
      private dataSource: IFileDataSource,
      private userAuth: UserAuthorization,
      private eventBus: EventBus<ApplicationEvent>
    ) {}
    
    async put(fileName:string, mimeType:string, sizeImBytes:number, path: string):Promise<FileMetaData | null> {
        return await this.dataSource.put(fileName, mimeType, sizeImBytes, path);
    }

    async prepare(fileId:string):Promise<string | null> {
      const filePath = `downloads/${fileId}`;
      await this.dataSource.prepare(fileId, filePath);
      return filePath;
    }
}