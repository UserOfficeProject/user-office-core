import querystring from 'querystring';

import { logger } from '@user-office-software/duo-logger';
import contentDisposition from 'content-disposition';
import { Request, Response, NextFunction } from 'express';
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
  SHIPMENT_LABEL = 'shipment-label',
}

export type MetaBase = { collectionFilename: string; singleFilename: string };
export type XLSXMetaBase = MetaBase & { columns: string[] };

const ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT;

if (!ENDPOINT) {
  logger.logError(
    'Could not start application: the `USER_OFFICE_FACTORY_ENDPOINT` environment variable is missing. Exiting.',
    {}
  );
  process.exit(1);
}

export default function callFactoryService<TData, TMeta extends MetaBase>(
  downloadType: DownloadType,
  type: PDFType | XLSXType,
  properties: { data: TData[]; meta: TMeta },
  req: Request,
  res: Response,
  next: NextFunction
) {
  const factoryReq = request.post(`${ENDPOINT}/${downloadType}/${type}`, {
    json: properties,
  });

  let gotResponse = false;

  req.once('close', () => {
    if (!gotResponse) {
      factoryReq.abort();
    }
  });

  factoryReq.on('error', (err) => {
    next({
      error: err.toString(),
      message: `Could not download generated ${downloadType}/${type}`,
    });
  });

  factoryReq.on('response', (factoryResp) => {
    gotResponse = true;

    req.once('close', () => {
      if (factoryResp.complete) {
        return;
      }

      factoryReq.abort();
    });

    if (factoryResp.statusCode !== 200) {
      // FIXME: this looks very ugly
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
  });
}
