import { UserAuthorization } from "../utils/UserAuthorization";
import PostgresFileDataSource from "../datasources/postgres/FileDataSource";
import { IFileDataSource } from "../datasources/IFileDataSource";

export default class FileQueries {
  
    constructor(
      private fileDataSource:IFileDataSource,
      private userAuth: UserAuthorization,
    ) {}

    async getFileMetadata(fileIds:string[]) {
      // TODO There should be authentification
      
      return this.fileDataSource.getMetadata(fileIds);
    }
}