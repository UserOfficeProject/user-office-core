import express, { Request, Response } from "express";
import schema from "./src/schema";
import root from "./src/resolvers";
import baseContext from "./src/buildContext";
import { ResolverContext } from "./src/context";
import { NextFunction } from "connect";
import { logger } from "./src/utils/Logger";

const graphqlHTTP = require("express-graphql");
const jwt = require("express-jwt");
const files = require("./src/routes/files");
const proposalDownload = require("./src/routes/pdf");
var cookieParser = require("cookie-parser");

interface Error {
  status?: number;
  code?: string;
}

interface Req extends Request {
  user?: any;
}

var app = express();

// authentication middleware
const authMiddleware = jwt({
  credentialsRequired: false,
  secret: process.env.secret
});

// GQL extensions. Required for logging
const extensions = async ({
  operationName,
  result,
}:{
  operationName:any,
  result:any,
}) => {
  if(result.errors) {
    logger.logError("Failed GRAPHQL execution", {result, operationName})
  }
};

app.use(
  authMiddleware,
  (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err.code === "invalid_token") {
      return res.status(401).send("jwt expired");
    }
    return res.sendStatus(400);
  }
);

app.use(cookieParser());

app.use(
  "/graphql",
  graphqlHTTP(async (req: Req) => {
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
      context,
      extensions
    };
  })
);



app.use(files);

app.use(proposalDownload);

app.listen(process.env.PORT || 4000);

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  logger.logException("Unhandled EXPRESS JS exception", err, {req, res})
  res.status(500).send('SERVER EXCEPTION');
})

process.on('uncaughtException', (err) => {
  logger.logException("Unhandled NODE exception", err)
});

console.log("Running a GraphQL API server at localhost:4000/graphql");
