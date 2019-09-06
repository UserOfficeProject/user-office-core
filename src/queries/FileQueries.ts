import { UserAuthorization } from "../utils/UserAuthorization";
import PostgresFileDataSource from "../datasources/postgres/FileDataSource";

export default class FileQueries {
    constructor(
      private dataSource: PostgresFileDataSource,
      private userAuth: UserAuthorization
    ) {}
}