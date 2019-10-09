import { IFileDataSource } from "../IFileDataSource";
import { FileMetadata } from "../../models/Blob";
import { LargeObjectManager } from "pg-large-object";
import database from "./database";
import { Client } from "pg";
import to from "await-to-js";
import { WriteStream, ReadStream } from "pg-large-object";
import fs, { createReadStream, createWriteStream } from "fs";

export default class PostgresFileDataSource implements IFileDataSource {
  async prepare(fileId: string, output:string): Promise<void> {

    const result = await database("files")
    .select("oid")
    .where("file_id",fileId)
    .first();

    return await this.retrieveBlob(parseInt(result.oid), output);
  }


  async getMetadata(fileIds: string[]): Promise<FileMetadata[]> {
      const fileMetadata:Array<any> = await database("files")
      .select(["file_id", "oid", "file_name", "file_name", "mime_type"," size_in_bytes", "created_at"])
      .whereIn("file_id",fileIds);
  
      return fileMetadata.map(row => {
        return {
          fileId:row.file_id, 
          oid:row.oid,
          originalFileName:row.file_name,
          mimeType:row.mime_type,
          sizeInBytes:row.size_in_bytes,
          createdDate:row.created_at
        }
      });
  }

  async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    path: string
  ): Promise<FileMetadata | null> {
    let err, oid, resultSet:any;

    [err, oid] = await to(this.storeBlob(path));
    if (err) {
      console.error("Could not store BLOB");
      return null;
    }

    fs.unlinkSync(path);

    [err, resultSet] = await to(
      database
        .insert({
          file_name: fileName,
          mime_type: mimeType,
          size_in_bytes: sizeInBytes,
          oid: oid
        })
        .into("files")
        .returning(["*"])
    );
    if (err) return null;

    const fileEntry = resultSet[0];
    return new FileMetadata(
      fileEntry.file_id,
      oid as number,
      fileName,
      mimeType,
      sizeInBytes,
      fileEntry.created_at
    );
  }

  private async storeBlob(filePath: string): Promise<number> {
    return new Promise(async (resolve, reject) => {
      let err: any, oid: number, stream: WriteStream, connection: Client | undefined;

      [err, connection] = await to(database.client.acquireConnection());
      if (err)
      {
        return reject(`Could not establish connection with database \n ${err}`);
      }
      
      if(!connection) 
      {
        return reject(`Could not obtain connection`);
      }

      [err] = await to(connection.query("BEGIN")); // start the transaction
      if (err) return reject(`Could not begin transaction \n${err}`);

      var blobManager = new LargeObjectManager({ pg: connection });
      // @ts-ignore
      [err, [oid, stream]] = await to(
        blobManager.createAndWritableStreamAsync()
      );
      if (err) {
        connection.emit("error", err);
        return reject(`Could not creaet writeable stream \n${err}`);
      }

      console.info(`Creating a large object with the oid ${oid}`);

      stream.on("finish", function() {
        // @ts-ignore Already checked
        connection.query("COMMIT", () => resolve(oid));
      });

      var fileStream = fs.createReadStream(filePath);
      fileStream.pipe(stream);
    });
  }

  private async retrieveBlob(oid: number, output:string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let err: any, stream: ReadStream, connection: Client | undefined, size;

      if(!output) reject("Output must be specified");

      [err, connection] = await to(database.client.acquireConnection());
      if (err)
      {
        return reject(`Could not establish connection with database \n ${err}`);
      }

      if(!connection) 
      {
        return reject(`Could not obtain connection`);
      }

      [err] = await to(connection.query("BEGIN")); // start the transaction
      if (err) return reject(`Could not begin transaction \n${err}`);
        
      const blobManager = new LargeObjectManager({ pg: connection });
      // @ts-ignore
      [err, [size, stream]] = await to(
        blobManager.openAndReadableStreamAsync(oid)
      );
      if (err) {
        connection.emit("error", err);
        return reject(`Could not create readale stream \n${err}`);
      }

      console.log("Streaming a large object with a total size of", size);

      stream.on("end", function() {
         // @ts-ignore Already checked
        connection.query("COMMIT", () => resolve());
      });

      // Store it as an image
      var fileStream = require("fs").createWriteStream(output);
      stream.pipe(fileStream);
    });
  }
}
