import querystring from 'querystring';

import { logger } from '@esss-swap/duo-logger';
import contentDisposition from 'content-disposition';
import { Response, NextFunction } from 'express';
import request from 'request';

import { bufferRequestBody } from './util';

export enum DownloadType {
  PDF = 'pdf',
  XLSX = 'xlsx',
}

export enum XLSXType {
  PROPOSAL = 'proposal',
  SEP = 'sep',
}

export enum PDFType {
  PROPOSAL = 'proposal',
  SAMPLE = 'sample',
}

export type MetaBase = { collectionFilename: string; singleFilename: string };
export type XLSXMetaBase = MetaBase & { columns: string[] };

const ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT;

if (!ENDPOINT) {
  console.error('`USER_OFFICE_FACTORY_ENDPOINT` is missing');
  process.exit(1);
}

export default function callFactoryService<TData, TMeta extends MetaBase>(
  downloadType: DownloadType,
  type: PDFType | XLSXType,
  properties: { data: TData[]; meta: TMeta },
  res: Response,
  next: NextFunction
) {
  const factoryReq = request
    .post(`${ENDPOINT}/${downloadType}/${type}`, { json: properties })
    .on('response', (factoryResp) => {
      if (factoryResp.statusCode !== 200) {
        bufferRequestBody(factoryReq)
          .then((body) => {
            logger.logError(`Failed to generate ${downloadType}/${type}`, {
              response: body,
              type,
            });
          })
          .catch((err) => {
            logger.logException(
              `Failed to generate ${downloadType}/${type} and read response body`,
              err,
              { type }
            );
          });

        next(`Failed to generate ${downloadType}/${type}`);
      } else {
        if (factoryResp.headers['content-type']) {
          res.setHeader('content-type', factoryResp.headers['content-type']);
        }

        const filename =
          properties.data.length > 1
            ? properties.meta.collectionFilename
            : properties.meta.singleFilename;

        res.setHeader('Content-Disposition', contentDisposition(filename));
        res.setHeader('x-download-filename', querystring.escape(filename));

        factoryResp.pipe(res);
      }
    })
    .on('error', (err) => {
      next({
        error: err.toString(),
        message: `Could not download generated ${downloadType}/${type}`,
      });
    });
}
