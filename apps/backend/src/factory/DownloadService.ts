import querystring from 'querystring';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

import { context, propagation, SpanKind, trace } from '@opentelemetry/api';
import contentDisposition from 'content-disposition';
import { Request, Response, NextFunction } from 'express';

import { Role } from '../models/Role';

export enum DownloadType {
  PDF = 'pdf',
  XLSX = 'xlsx',
  ZIP = 'zip',
}

export enum XLSXType {
  PROPOSAL = 'proposal',
  FAP = 'fap',
  CALL_FAP = 'call_fap',
  TECHNIQUE = 'technique',
}

export enum PDFType {
  PROPOSAL = 'proposal',
  SAMPLE = 'sample',
  SHIPMENT_LABEL = 'shipment-label',
}
export enum ZIPType {
  ATTACHMENT = 'attachment',
  PROPOSAL = 'proposal',
}

export type MetaBase = { collectionFilename: string; singleFilename: string };
export type XLSXMetaBase = MetaBase & { columns: string[] };

const ENDPOINT = process.env.USER_OFFICE_FACTORY_ENDPOINT;

export interface DownloadService {
  callFactoryService<TData, TMeta extends MetaBase>(
    downloadType: DownloadType,
    type: PDFType | XLSXType | ZIPType,
    properties: { data: TData[]; meta: TMeta; userRole: Role },
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void>;
}

export async function fetchDataAndStreamResponse<TData, TMeta extends MetaBase>(
  downloadType: DownloadType,
  type: PDFType | XLSXType | ZIPType,
  properties: { data: TData[]; meta: TMeta; userRole: Role },
  req: Request,
  res: Response,
  next: NextFunction
) {
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

    const tracer = trace.getTracer('default');

    await tracer.startActiveSpan(
      'factory-service-call',
      { kind: SpanKind.CLIENT },
      async (span) => {
        try {
          const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          };
          propagation.inject(context.active(), headers);

          const factoryResp = await fetch(
            `${ENDPOINT}/${downloadType}/${type}`,
            {
              signal: controller.signal,
              headers: headers,
              method: 'POST',
              body: JSON.stringify(properties),
            }
          );

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
        } catch (err: unknown) {
          if (err instanceof Error) {
            span.recordException(err);
            span.setStatus({ code: 2, message: err.message });
          } else {
            span.recordException({
              name: 'UnknownError',
              message: String(err),
            });
            span.setStatus({ code: 2, message: String(err) });
          }
        } finally {
          span.end();
        }
      }
    );
  } catch (error) {
    next({
      error,
      message: `Could not download generated ${downloadType}/${type}`,
    });
  }
}
