import Knex from "knex";
import { Logger } from "../../utils/Logger";

const db = Knex({
  client: "postgresql",
  connection: process.env.DATABASE_URL
});

const dbLogger = new Logger();
db.on("query-error", function(error: any, obj: any) {
  dbLogger.logError("QUERY ERROR", { error, obj });
});

export default db;
