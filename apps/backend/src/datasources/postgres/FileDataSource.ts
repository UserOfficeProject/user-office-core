/* eslint-disable prefer-const */
import fs from 'fs';

import { logger } from '@user-office-software/duo-logger';
import to from 'await-to-js';
import { GraphQLError } from 'graphql';
import { Client } from 'pg';
import { LargeObjectManager, ReadStream } from 'pg-large-object';

import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../FileDataSource';
import database from './database';
import { FileRecord, ProposalRecord, createFileMetadata } from './records';

export default class PostgresFileDataSource implements FileDataSource {
  public async prepare(fileId: string, output: string): Promise<string> {
    const result = await database('files')
      .select('oid')
      .where('file_id', fileId)
      .first();

    await this.retrieveBlob(parseInt(result.oid), output);

    return fileId;
  }

  async getMetadata(fileIds?: string[]): Promise<FileMetadata[]> {
    return database('files')
      .select('*')
      .modify((queryBuilder) => {
        if (fileIds && fileIds.length > 0) {
          queryBuilder.whereIn('file_id', fileIds);
        }
      })
      .then((records: FileRecord[]) => {
        return records.map((record) => createFileMetadata(record));
      });
  }

  public async put(
    fileName: string,
    mimeType: string,
    sizeInBytes: number,
    path: string
  ): Promise<FileMetadata> {
    const oid = await this.storeBlob(path);

    fs.unlinkSync(path);
    const resultSet: FileRecord[] = await database
      .insert({
        file_name: fileName,
        mime_type: mimeType,
        size_in_bytes: sizeInBytes,
        oid: oid,
      })
      .into('files')
      .returning(['*']);
    if (!resultSet || resultSet.length !== 1) {
      throw new GraphQLError('Expected to receive entry');
    }

    return createFileMetadata(resultSet[0]);
  }

  public async putProposalPdf(
    fileName: string,
    mimeType: string,
    stream: NodeJS.ReadableStream,
    proposalPk: number
  ): Promise<FileMetadata> {
    const result = await this.storeBlobFromStream(stream);

    if (!result || !result.oid || !result.sizeInBytes) {
      throw new GraphQLError('Failed to store blob from stream');
    }

    const oid = result.oid;
    const sizeInBytes = result.sizeInBytes;

    /*
    In a transaction, update the files table with the new
    file metadata, then update the proposal with its file_id.
    */
    return await database.transaction(async (trx) => {
      const fileMetaData: FileRecord[] = await database
        .insert({
          file_name: fileName,
          mime_type: mimeType,
          size_in_bytes: sizeInBytes,
          oid: oid,
        })
        .into('files')
        .returning(['*'])
        .transacting(trx);

      if (fileMetaData.length === 0) {
        throw new GraphQLError('Failed to insert metadata into files table');
      }

      const proposal: ProposalRecord[] = await database
        .update({
          file_id: fileMetaData[0].file_id,
        })
        .from('proposals')
        .where('proposal_pk', proposalPk)
        .returning(['*'])
        .transacting(trx);

      if (proposal.length === 0) {
        throw new GraphQLError('Failed to insert file_id into proposals table');
      }

      return createFileMetadata(fileMetaData[0]);
    });
  }

  private async storeBlob(filePath: string): Promise<number> {
    const [err, connection] = await to<Client, Error>(
      database.client.acquireConnection()
    );
    if (err) {
      throw new GraphQLError(
        `Could not establish connection to database \n ${err}`
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
      throw new Error(`Could not establish connection to database: ${err}`);
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

  public async getBlobdata(fileName: string): Promise<ReadStream | null> {
    if (!fileName) {
      return null;
    }

    const result = await database('files as f')
      .select('oid')
      .where('file_name', fileName)
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

  public async delete(oid: number): Promise<boolean> {
    return database
      .transaction(async (trx) => {
        const [metadataErr, fileRecord] = await to(
          database('files')
            .select('oid')
            .where('oid', oid)
            .first()
            .transacting(trx)
        );

        if (metadataErr) {
          throw new GraphQLError(
            `Failed to get file metadata for deletion: ${metadataErr.message}`
          );
        }

        if (!fileRecord) {
          logger.logInfo('No file metadata found for deletion.', { oid: oid });

          return false;
        }

        const pgClient = await (trx.client as any).acquireConnection();

        const blobManager = new LargeObjectManager({ pg: pgClient });
        const [unlinkError] = await to(blobManager.unlinkAsync(oid));

        if (unlinkError) {
          throw new GraphQLError(
            `Failed to delete large object with OID ${oid}: ${unlinkError.message}`
          );
        }

        const [deleteMetadataErr] = await to(
          database('files').where('oid', oid).del().transacting(trx)
        );

        if (deleteMetadataErr) {
          throw new GraphQLError(
            `Failed to delete file metadata for oid ${oid}: ${deleteMetadataErr.message}`
          );
        }

        return true;
      })
      .catch((error) => {
        throw new GraphQLError(
          `An unexpected error occurred during file deletion of OID ${oid}: ${error.message}`
        );
      });
  }
}
