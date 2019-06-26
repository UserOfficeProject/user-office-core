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
    // If the user is accessible though a query, it could look something like:
    //   const userId = req.session.userId;
    //   const user = await baseContext.queries.user.get(userId);
    // Mock user instead:
    const user = new User(0, "Carl", "Carlsson");
    const context: ResolverContext = { ...baseContext, user };
    //console.log(_req);
    console.log(req.user);
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
