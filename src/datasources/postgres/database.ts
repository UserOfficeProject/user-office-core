var Knex = require("knex");

export default new Knex({
  client: "postgresql",
  connection: process.env.DATABASE_URL
});
