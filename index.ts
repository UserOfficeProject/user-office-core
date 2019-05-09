var express = require("express");
var graphqlHTTP = require("express-graphql");
import schema from "./src/schema";
import Proposal from "./src/models/Proposal";
import root from "./src/resolvers";
import context from "./src/context";

console.log(Proposal);
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    context: context
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/graphql");
