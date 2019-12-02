import Knex from "knex";
import { logger } from "../../utils/Logger";

const db = Knex({
  client: "postgresql",
  connection: process.env.DATABASE_URL
});

db.on("query-error", function(error: any, obj: any) {
  logger.logError("QUERY ERROR", { error, obj });
});

export default db;
