/* eslint-disable prefer-const */
import fs from 'fs';

import to from 'await-to-js';
import { GraphQLError } from 'graphql';
import { Client } from 'pg';
import { LargeObjectManager, ReadStream } from 'pg-large-object';

import { FileMetadata } from '../../models/Blob';
import { FilesMetadataFilter } from '../../resolvers/queries/FilesMetadataQuery';
import { FileDataSource } from '../FileDataSource';
import database from './database';
import { FileRecord, createFileMetadata } from './records';

export default class PostgresFileDataSource implements FileDataSource {
  public async prepare(fileId: string, output: string): Promise<string> {
    const result = await database('files')
      .select('oid')
      .where('file_id', fileId)
      .first();

    await this.retrieveBlob(parseInt(result.oid), output);

    return fileId;
  }

  async getMetadata(fileId: string): Promise<FileMetadata>;
  async getMetadata(filter: FilesMetadataFilter): Promise<FileMetadata[]>;
  async getMetadata(param: unknown): Promise<FileMetadata | FileMetadata[]> {
    if (param instanceof FilesMetadataFilter) {
      const filter = param as FilesMetadataFilter;

      if (!filter.fileIds || filter.fileIds.length === 0) {
        return [];
      }

      return database('files')
        .select('*')
        .whereIn('file_id', filter.fileIds)
        .then((records: FileRecord[]) => {
          return records.map((record) => createFileMetadata(record));
        });
    }

    if (typeof param === 'string') {
      const fileId = param as string;

      return database('files')
        .select('*')
        .where('file_id', fileId)
        .first()
        .then((record: FileRecord) => {
          return createFileMetadata(record);
        });
    }

    throw new GraphQLError('Unsupported input for getMetaData');
  }

  public async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    filePath: string,
    internalUse?: boolean
  ): Promise<FileMetadata>;
  public async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number | undefined,
    readableStream: NodeJS.ReadableStream,
    internalUse?: boolean
  ): Promise<FileMetadata>;
  public async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number | undefined,
    source: string | NodeJS.ReadableStream,
    internalUse?: boolean
  ): Promise<FileMetadata> {
    let oid: number;

    if (typeof source === 'string') {
      if (typeof sizeInBytes !== 'number') {
        throw new GraphQLError(
          'sizeInBytes must be provided when putting from a file path.'
        );
      }
      oid = await this.storeBlob(source);
      fs.unlinkSync(source);
    } else {
      const result = await this.storeBlobFromStream(source);
      oid = result.oid;
      sizeInBytes = result.sizeInBytes;
    }

    const resultSet: FileRecord[] = await database
      .insert({
        file_name: fileName,
        mime_type: mimeType,
        size_in_bytes: sizeInBytes,
        oid: oid,
        ...(internalUse === true && { internal_use: true }),
      })
      .into('files')
      .returning(['*']);

    if (!resultSet || resultSet.length !== 1) {
      throw new GraphQLError('Expected to receive entry');
    }

    return createFileMetadata(resultSet[0]);
  }

  private async storeBlob(filePath: string): Promise<number> {
    const [err, connection] = await to<Client, Error>(
      database.client.acquireConnection()
    );
    if (err) {
      throw new GraphQLError(
        `Could not establish connection with database \n ${err}`
      );
    }

    if (!connection) {
      throw new GraphQLError('Could not obtain connection');
    }

    return new Promise<number>(async (resolve, reject) => {
      const [transactionError] = await to(connection.query('BEGIN')); // start the transaction
      if (transactionError) {
        return reject(`Could not begin transaction \n${transactionError}`);
      }

      const blobManager = new LargeObjectManager({ pg: connection });

      const [writeableStreamError, response] = await to(
        blobManager.createAndWritableStreamAsync()
      );
      if (writeableStreamError || !response) {
        connection.emit('error', writeableStreamError);

        return reject(
          `Could not create writeable stream \n${writeableStreamError} ${response}`
        );
      }

      const [oid, stream] = response;

      stream.on('finish', () => {
        connection.query('COMMIT', () => resolve(oid));
      });

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(stream);
    })
      .then((newOid) => {
        return newOid;
      })
      .finally(() => {
        database.client.releaseConnection(connection);
      });
  }

  private async storeBlobFromStream(
    readableStream: NodeJS.ReadableStream
  ): Promise<{ oid: number; sizeInBytes: number }> {
    const [err, connection] = await to<Client, Error>(
      database.client.acquireConnection()
    );
    if (err) {
      throw new Error(`Could not establish connection with database: ${err}`);
    }

    if (!connection) {
      throw new Error('Could not obtain database connection.');
    }

    return new Promise(async (resolve, reject) => {
      const [transactionError] = await to(connection.query('BEGIN'));
      if (transactionError) {
        database.client.releaseConnection(connection);

        return reject(`Could not begin transaction: ${transactionError}`);
      }

      const blobManager = new LargeObjectManager({ pg: connection });

      const [writeableStreamError, response] = await to(
        blobManager.createAndWritableStreamAsync()
      );
      if (writeableStreamError || !response) {
        connection.query('ROLLBACK', () => {
          database.client.releaseConnection(connection);
          reject(`Could not create writable stream: ${writeableStreamError}`);
        });

        return;
      }

      const [oid, stream] = response;
      let sizeInBytes = 0;

      stream.on('finish', () => {
        connection.query('COMMIT', () => {
          database.client.releaseConnection(connection);
          resolve({ oid, sizeInBytes });
        });
      });

      stream.on('error', (streamError) => {
        connection.query('ROLLBACK', () => {
          database.client.releaseConnection(connection);
          reject(`Error writing to large object stream: ${streamError}`);
        });
      });

      readableStream.on('error', (readError) => {
        stream.destroy(readError);
        connection.query('ROLLBACK', () => {
          database.client.releaseConnection(connection);
          reject(`Error reading from response stream: ${readError}`);
        });
      });

      /*
       Override the stream's write method to track bytes
       written without consuming the stream twice.
      */
      const originalWrite = stream.write.bind(stream);
      stream.write = (chunk: any, encoding?: any, callback?: any): boolean => {
        sizeInBytes += Buffer.isBuffer(chunk)
          ? chunk.length
          : Buffer.byteLength(chunk, encoding);

        return originalWrite(chunk, encoding, callback);
      };

      readableStream.pipe(stream);
    });
  }

  private async retrieveBlob(oid: number, output: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!output) reject('Output must be specified');

      const [connectionError, connection] = await to(
        database.client.acquireConnection() as Promise<Client | undefined>
      );
      if (connectionError || !connection) {
        return reject(
          `Error ocurred while establishing connection with database \n ${connectionError} ${connection}`
        );
      }

      const [transactionError] = await to(connection.query('BEGIN')); // start the transaction
      if (transactionError) {
        database.client.releaseConnection(connection);

        return reject(`Could not begin transaction \n${transactionError}`);
      }

      const blobManager = new LargeObjectManager({ pg: connection });
      const [streamErr, response] = await to(
        blobManager.openAndReadableStreamAsync(oid)
      );

      if (streamErr || !response) {
        connection.emit('error', streamErr);
        database.client.releaseConnection(connection);

        return reject(
          `Could not create readable stream \n${streamErr} ${response}`
        );
      }

      const [, stream] = response;

      stream.on('end', function () {
        connection?.query('COMMIT', () => resolve());
        database.client.releaseConnection(connection);
      });

      // Store it as an image
      const fileStream = fs.createWriteStream(output);
      stream.pipe(fileStream);
    });
  }

  public async getBlobdata(
    fileName: string,
    internalUse?: boolean
  ): Promise<ReadStream | null> {
    if (!fileName) {
      return null;
    }

    const result = await database('files as f')
      .select('oid')
      .where('file_name', fileName)
      .modify((query) => {
        if (internalUse === true) {
          query.andWhere('f.internal_use', true);
        }
      })
      .first();

    if (!result) {
      return null;
    }

    const resp = await this.retrieveBlobData(parseInt(result.oid));

    return resp;
  }

  private async retrieveBlobData(oid: number): Promise<ReadStream | null> {
    return new Promise(async (resolve, reject) => {
      const [connectionError, connection] = await to(
        database.client.acquireConnection() as Promise<Client | undefined>
      );
      if (connectionError || !connection) {
        return reject(
          `Error ocurred while establishing connection with database \n ${connectionError} ${connection}`
        );
      }

      const [transactionError] = await to(connection.query('BEGIN'));
      if (transactionError) {
        database.client.releaseConnection(connection);

        return reject(`Could not begin transaction \n${transactionError}`);
      }

      const blobManager = new LargeObjectManager({ pg: connection });
      const [streamErr, response] = await to(
        blobManager.openAndReadableStreamAsync(oid)
      );

      if (streamErr || !response) {
        await connection.query('ROLLBACK');
        database.client.releaseConnection(connection);

        return reject(
          `Could not create readable stream \n${streamErr} ${response}`
        );
      }

      const [, stream] = response;

      stream.on('error', async (streamError) => {
        await connection.query('ROLLBACK');
        database.client.releaseConnection(connection);

        reject(`Stream error: ${streamError}`);
      });

      stream.on('end', async function () {
        await connection.query('COMMIT');
        database.client.releaseConnection(connection);

        resolve(stream);
      });

      resolve(stream);
    });
  }
}
