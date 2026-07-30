import querystring from 'querystring';

import { logger } from '@user-office-software/duo-logger';
import contentDisposition from 'content-disposition';
import { NextFunction, Request, Response } from 'express';

import { canRenderLocally, renderLocalPdf } from './localRenderer';
import { Role } from '../../models/Role';
import callFactoryService, {
  DownloadType,
  MetaBase,
  PDFType,
} from '../service';

/**
 * Single dispatch point for PDF responses.
 *
 * Requests that the local typst engine can serve are rendered in this process.
 * Everything else, and anything the local engine fails on, goes to the factory
 * service as before.
 */

type PdfProperties<TData, TMeta extends MetaBase> = {
  data: TData[];
  meta: TMeta;
  userRole: Role;
};

function filenameFor<TMeta extends MetaBase>(
  data: unknown[],
  meta: TMeta
): string {
  return data.length > 1 ? meta.collectionFilename : meta.singleFilename;
}

export default async function sendPdf<TData, TMeta extends MetaBase>(
  type: PDFType,
  properties: PdfProperties<TData, TMeta>,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (canRenderLocally(type, properties.data)) {
    try {
      const pdf = renderLocalPdf(type, properties.data, properties.userRole);
      const filename = filenameFor(properties.data, properties.meta);

      if (filename) {
        res.setHeader('Content-Disposition', contentDisposition(filename));
        res.setHeader('x-download-filename', querystring.escape(filename));
      }

      res.setHeader('content-type', 'application/pdf');
      res.send(pdf);

      return;
    } catch (error) {
      // A template the local engine cannot handle should not fail the download.
      logger.logException(
        `Local PDF rendering failed for ${type}, falling back to the factory service`,
        error
      );
    }
  }

  return callFactoryService<TData, TMeta>(
    DownloadType.PDF,
    type,
    properties,
    req,
    res,
    next
  );
}
