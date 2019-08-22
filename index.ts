const express = require("express");
const graphqlHTTP = require("express-graphql");
const jwt = require("express-jwt");
const config = require("./config");

import { Request } from "express";

import schema from "./src/schema";
import root from "./src/resolvers";
import baseContext from "./src/buildContext";
import { ResolverContext } from "./src/context";

var app = express();

// authentication middleware
const authMiddleware = jwt({
  credentialsRequired: false,
  secret: config.secret
});

app.use(authMiddleware, function(err, req, res, next) {
  if (err.code === "invalid_token") {
    return res.sendStatus(401, "jwt expired");
  }
  return res.sendStatus(400);
});

app.use(
  "/graphql",
  graphqlHTTP(async (req: Request) => {
    // Adds the currently logged-in user to the context object, which makes it available to the resolvers
    // The user sends a JWT token that is decrypted, this JWT token contains information about roles and ID
    let user = null;
    if (req.user) {
      user = await baseContext.queries.user.getAgent(req.user.user.id);
    }

    const context: ResolverContext = { ...baseContext, user };

    return {
      schema: schema,
      rootValue: root,
      graphiql: true,
      context
    };
  })
);

app.listen(process.env.PORT || 4000);

console.log("Running a GraphQL API server at localhost:4000/graphql");
