/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/camelcase */
// @ts-nocheck
import fs from 'fs';

import to from 'await-to-js';
import { Client } from 'pg';
import { LargeObjectManager } from 'pg-large-object';
import { WriteStream, ReadStream } from 'pg-large-object';

import { FileMetadata } from '../../models/Blob';
import { FileDataSource } from '../IFileDataSource';
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

  public async getMetadata(fileIds: string[]): Promise<FileMetadata[]> {
    if (fileIds.length === 0) {
      return [];
    }

    return database('files')
      .select([
        'file_id',
        'oid',
        'file_name',
        'file_name',
        'mime_type',
        'size_in_bytes',
        'created_at',
      ])
      .whereIn('file_id', fileIds)
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
    const oid = await this.storeBlob(path);

    fs.unlinkSync(path);
    const resultSet = await database
      .insert({
        file_name: fileName,
        mime_type: mimeType,
        size_in_bytes: sizeInBytes,
        oid: oid,
      })
      .into('files')
      .returning(['*']);

    if (!resultSet || resultSet.length !== 1) {
      throw new Error('Expected to receive entry');
    }

    return createFileMetadata(resultSet[0]);
  }

  private async storeBlob(filePath: string): Promise<number> {
    const [err, connection] = await to<Client, Error>(
      database.client.acquireConnection()
    );
    if (err) {
      throw new Error(`Could not establish connection with database \n ${err}`);
    }

    if (!connection) {
      throw new Error('Could not obtain connection');
    }

    return new Promise<number>(async (resolve, reject) => {
      let err: any, oid: number, stream: WriteStream;

      [err] = await to(connection.query('BEGIN')); // start the transaction
      if (err) {
        return reject(`Could not begin transaction \n${err}`);
      }

      const blobManager = new LargeObjectManager({ pg: connection });
      [err, [oid, stream]] = await to(
        blobManager.createAndWritableStreamAsync()
      );
      if (err) {
        connection.emit('error', err);

        return reject(`Could not create writeable stream \n${err}`);
      }

      stream.on('finish', () => {
        connection.query('COMMIT', () => resolve(oid));
      });

      const fileStream = fs.createReadStream(filePath);
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

      if (!output) reject('Output must be specified');

      [err, connection] = await to(database.client.acquireConnection());
      if (err) {
        return reject(`Could not establish connection with database \n ${err}`);
      }

      if (!connection) {
        return reject('Could not obtain connection');
      }

      [err] = await to(connection.query('BEGIN')); // start the transaction
      if (err) {
        database.client.releaseConnection(connection);

        return reject(`Could not begin transaction \n${err}`);
      }

      const blobManager = new LargeObjectManager({ pg: connection });
      [err, [size, stream]] = await to(
        blobManager.openAndReadableStreamAsync(oid)
      );
      if (err) {
        connection.emit('error', err);
        database.client.releaseConnection(connection);

        return reject(`Could not create readale stream \n${err}`);
      }

      console.log('Streaming a large object with a total size of', size);

      stream.on('end', function() {
        connection?.query('COMMIT', () => resolve());
        database.client.releaseConnection(connection);
      });

      // Store it as an image
      const fileStream = require('fs').createWriteStream(output);
      stream.pipe(fileStream);
    });
  }
}
