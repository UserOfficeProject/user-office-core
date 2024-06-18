import querystring from 'querystring';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

import { logger } from '@user-office-software/duo-logger';
import contentDisposition from 'content-disposition';
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { FileDataSource } from '../datasources/IFileDataSource';
import { Role } from '../models/Role';
import {
  MetaBase,
  DownloadType,
  PDFType,
  XLSXType,
  ZIPType,
  DownloadService,
} from './DownloadService';
import { ProposalPDFData } from './pdf/proposal';

const ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT;

export class StfcDownloadService implements DownloadService {
  async callFactoryService<TData, TMeta extends MetaBase>(
    downloadType: DownloadType,
    type: PDFType | XLSXType | ZIPType,
    properties: { data: TData[]; meta: TMeta; userRole: Role },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!ENDPOINT) {
      logger.logError(
        'Could not start application: the `USER_OFFICE_FACTORY_ENDPOINT` environment variable is missing. Exiting.',
        {}
      );
      process.exit(1);
    }

    let isPdfAvailable = false;
    let proposalPdfData = null;
    const data = properties?.data[0] as ProposalPDFData;

    if (properties?.data?.length === 1) {
      const fileDataSource = container.resolve<FileDataSource>(
        Tokens.FileDataSource
      );
      proposalPdfData = await fileDataSource.getBlobdata(
        `Migrated-${data.proposal.proposalId}.pdf`
      );

      if (proposalPdfData) {
        isPdfAvailable = true;
      }
    }

    if (isPdfAvailable && proposalPdfData) {
      try {
        const fileName = `${data.proposal.proposalId}_${
          data.principalInvestigator.lastname
        }_${data.proposal.created.getUTCFullYear()}.pdf`;

        res.setHeader('Content-Disposition', contentDisposition(fileName));
        res.setHeader('x-download-filename', querystring.escape(fileName));
        res.setHeader('content-type', 'application/pdf');

        proposalPdfData.pipe(res);
        await new Promise((f) => setTimeout(f, 1000));
        proposalPdfData.emit('end');
      } catch (error) {
        next({
          error,
          message: 'Could not download generated',
        });
      }
    } else {
      const controller = new AbortController();

      try {
        let gotResponse = false;

        req.on('close', () => {
          if (!gotResponse) {
            controller.abort();
          }
        });

        req.on('end', () => {
          gotResponse = true;
        });

        const factoryResp = await fetch(`${ENDPOINT}/${downloadType}/${type}`, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify(properties),
        });

        if (!factoryResp.ok) {
          throw new Error(await factoryResp.text());
        }

        const factoryRespBody = factoryResp.body;
        if (!factoryRespBody) {
          return;
        }

        const readableStream = Readable.fromWeb(
          factoryRespBody as ReadableStream,
          {
            signal: controller.signal,
          }
        );

        readableStream.on('error', (err) => {
          next({
            error: err.toString(),
            message: `Could not download generated ${downloadType}/${type}`,
          });
        });

        const filename =
          properties.data.length > 1
            ? properties.meta.collectionFilename
            : properties.meta.singleFilename;

        const contentTypeHeaders = factoryResp.headers.get('content-type');

        res.setHeader('Content-Disposition', contentDisposition(filename));
        res.setHeader('x-download-filename', querystring.escape(filename));
        if (contentTypeHeaders) {
          res.setHeader('content-type', contentTypeHeaders);
        }

        readableStream.pipe(res);
      } catch (error) {
        next({
          error,
          message: `Could not download generated ${downloadType}/${type}`,
        });
      }
    }
  }
}
