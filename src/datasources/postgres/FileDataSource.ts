import { IFileDataSource } from "../IFileDataSource";
import { FileMetadata } from "../../models/Blob";
import { LargeObjectManager } from "pg-large-object";
import database from "./database";
import { Client } from "pg";
import to from "await-to-js";
import { WriteStream, ReadStream } from "pg-large-object";
import fs from "fs";
import { FileRecord, createFileMetadata } from "./records";

export default class PostgresFileDataSource implements IFileDataSource {
  public async prepare(fileId: string, output: string): Promise<string> {
    const result = await database("files")
      .select("oid")
      .where("file_id", fileId)
      .first();

    await this.retrieveBlob(parseInt(result.oid), output);
    return fileId;
  }

  public async getMetadata(fileIds: string[]): Promise<FileMetadata[]> {
    return database("files")
      .select([
        "file_id",
        "oid",
        "file_name",
        "file_name",
        "mime_type",
        "size_in_bytes",
        "created_at"
      ])
      .whereIn("file_id", fileIds)
      .then((records: FileRecord[]) => {
        return records.map(record => createFileMetadata(record));
      });
  }

  public async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    path: string
  ): Promise<FileMetadata> {
    let err, oid, resultSet: any;

    oid = await this.storeBlob(path);

    fs.unlinkSync(path);
    resultSet = await database
      .insert({
        file_name: fileName,
        mime_type: mimeType,
        size_in_bytes: sizeInBytes,
        oid: oid
      })
      .into("files")
      .returning(["*"]);

    if (!resultSet || resultSet.length !== 1) {
      throw new Error("Expected to receive entry");
    }
    return createFileMetadata(resultSet[0]);
  }

  private async storeBlob(filePath: string): Promise<number> {
    let [err, connection] = await to<Client, Error>(
      database.client.acquireConnection()
    );
    if (err) {
      throw new Error(`Could not establish connection with database \n ${err}`);
    }

    if (!connection) {
      throw new Error(`Could not obtain connection`);
    }

    return new Promise<number>(async (resolve, reject) => {
      let err: any, oid: number, stream: WriteStream;

      [err] = await to(connection!.query("BEGIN")); // start the transaction
      if (err) {
        return reject(`Could not begin transaction \n${err}`);
      }

      var blobManager = new LargeObjectManager({ pg: connection });
      // @ts-ignore
      [err, [oid, stream]] = await to(
        blobManager.createAndWritableStreamAsync()
      );
      if (err) {
        connection!.emit("error", err);
        return reject(`Could not create writeable stream \n${err}`);
      }

      stream.on("finish", () => {
        connection!.query("COMMIT", () => resolve(oid));
      });

      var fileStream = fs.createReadStream(filePath);
      fileStream.pipe(stream);
    })
      .then(newOid => {
        return newOid;
      })
      .finally(() => {
        database.client.releaseConnection(connection);
      });
  }

  private async retrieveBlob(oid: number, output: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      let err: any, stream: ReadStream, connection: Client | undefined, size;

      if (!output) reject("Output must be specified");

      [err, connection] = await to(database.client.acquireConnection());
      if (err) {
        return reject(`Could not establish connection with database \n ${err}`);
      }

      if (!connection) {
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
