import querystring from 'querystring';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

import { context, propagation, SpanKind, trace } from '@opentelemetry/api';
import contentDisposition from 'content-disposition';
import { Request, Response, NextFunction } from 'express';

import { isTracingEnabled } from '../middlewares/tracing/tracing';
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
  EXPERIMENT_SAFETY = 'experiment-safety',
}
export enum ZIPType {
  ATTACHMENT = 'attachment',
  PROPOSAL = 'proposal',
}

export type MetaBase = { collectionFilename: string; singleFilename: string };
export type XLSXMetaBase = MetaBase & { columns: string[] };

const ENDPOINT = 'http://localhost:4500/generate'; //process.env.USER_OFFICE_FACTORY_ENDPOINT;

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

    let factoryRespBody;
    let contentTypeHeaders;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (isTracingEnabled()) {
      const tracer = trace.getTracer('default');

      await tracer.startActiveSpan(
        'factory-service-call',
        { kind: SpanKind.CLIENT },
        async (span) => {
          try {
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

            factoryRespBody = factoryResp.body;
            if (!factoryRespBody) {
              return;
            }

            contentTypeHeaders = factoryResp.headers.get('content-type');
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
    } else {
      const factoryResp = await fetch(`${ENDPOINT}/${downloadType}/${type}`, {
        signal: controller.signal,
        headers: headers,
        method: 'POST',
        body: JSON.stringify(properties),
      });

      if (!factoryResp.ok) {
        throw new Error(await factoryResp.text());
      }

      factoryRespBody = factoryResp.body;
      if (!factoryRespBody) {
        return;
      }

      contentTypeHeaders = factoryResp.headers.get('content-type');
    }

    const readableStream = Readable.fromWeb(factoryRespBody as ReadableStream, {
      signal: controller.signal,
    });

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
