var Knex = require("knex");

export default new Knex({
  client: "postgresql",
  connection: {
    host: "127.0.0.1",
    user: "duouser",
    password: "duopassword",
    database: "duo"
  }
});
