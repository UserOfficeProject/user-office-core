import express, { Request, Response, NextFunction } from "express";
import "reflect-metadata";
import baseContext from "./src/buildContext";
import { ResolverContext } from "./src/context";
import { logger } from "./src/utils/Logger";
import graphqlHTTP, { RequestInfo } from "express-graphql";
import { buildSchema } from "type-graphql";

const jwt = require("express-jwt");
const files = require("./src/routes/files");
const proposalDownload = require("./src/routes/pdf");

var cookieParser = require("cookie-parser");

interface Req extends Request {
  user?: any;
}

async function bootstrap() {
  var app = express();

  // authentication middleware
  const authMiddleware = jwt({
    credentialsRequired: false,
    secret: process.env.secret
  });

  const extensions = async (info: RequestInfo) => {
    if (info.result.errors) {
      logger.logError("Failed GRAPHQL execution", {
        result: info.result,
        operationName: info.operationName,
        user: info.context.user
      });
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

  const schema = await buildSchema({
    resolvers: [
      __dirname + "/src/resolvers/**/*Query.ts",
      __dirname + "/src/resolvers/**/*Mutation.ts",
      __dirname + "/src/resolvers/**/*Resolver.ts"
    ]
  });

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
        schema,
        graphiql: true,
        context,
        extensions
      };
    })
  );

  app.use(files);

  app.use(proposalDownload);

  app.listen(process.env.PORT || 4000);

  app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
    logger.logException("Unhandled EXPRESS JS exception", err, { req, res });
    res.status(500).send("SERVER EXCEPTION");
  });

  process.on("uncaughtException", err => {
    logger.logException("Unhandled NODE exception", err);
  });

  console.log("Running a GraphQL API server at localhost:4000/graphql");
}

bootstrap();
