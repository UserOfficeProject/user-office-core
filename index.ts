const express = require("express");
const graphqlHTTP = require("express-graphql");
const jwt = require("express-jwt");

import { Request } from "express";

import schema from "./src/schema";
import root from "./src/resolvers";
import baseContext from "./src/buildContext";
import { ResolverContext } from "./src/context";
import User from "./src/models/User";

var app = express();

// authentication middleware
const authMiddleware = jwt({
  credentialsRequired: false,
  secret: "somesuperdupersecret"
});

app.use(authMiddleware);

app.use(
  "/graphql",
  graphqlHTTP(async (req: Request) => {
    // Adds the currently logged-in user to the context object, which makes it available to the resolvers
    // The user sends a JWT token that is decrypted, this JWT token contains information about roles and ID
    const user = req.user;
    const context: ResolverContext = { ...baseContext, user };

    return {
      schema: schema,
      rootValue: root,
      graphiql: true,
      context
    };
  })
);

app.listen(4000);
console.log("Running a GraphQL API server at localhost:4000/graphql");
