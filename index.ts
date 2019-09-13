import express, { Request, Response } from 'express'
const graphqlHTTP = require("express-graphql");
const jwt = require("express-jwt");
<<<<<<< HEAD
import { NextFunction, Request, Response } from "express";
=======
const config = require("./config");

>>>>>>> ea0721cabc966b8e7962c2c0ad6e5f6c5fede26c

import schema from "./src/schema";
import root from "./src/resolvers";
import baseContext from "./src/buildContext";
import { ResolverContext } from "./src/context";
import multer from "multer";
import { unlink } from 'fs';
import { NextFunction } from 'connect';

var upload = multer({ dest: "uploads/" });

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


app.use(authMiddleware, (err:any, req:Request, res:Response, next:NextFunction) => {
  if (err.code === "invalid_token") {
    return res.status(401).send("jwt expired");
  }
  return res.sendStatus(400);
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { originalname, size, mimetype, path } = req.file as Express.Multer.File;
    var result = await baseContext.mutations.file.put(
      originalname,
      mimetype,
      size,
      path
    );
    res.status(200).send(result);
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get("/download/:file_id", async (req, res) => {
  try {
      const path = await baseContext.mutations.file.prepare(req.params.file_id);
      await res.download(path, 'file.png', () => {
        unlink(path, () => {}); // delete file once done
      });
  } catch (e) {
    res.status(500).send(e);
  }
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
      schema: schema,
      rootValue: root,
      graphiql: true,
      context
    };
  })
);

app.listen(process.env.PORT || 4000);

console.log("Running a GraphQL API server at localhost:4000/graphql");
