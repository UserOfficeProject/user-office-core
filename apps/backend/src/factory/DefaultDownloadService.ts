import { Request, Response, NextFunction } from 'express';

import { Role } from '../models/Role';
import {
  MetaBase,
  DownloadType,
  PDFType,
  XLSXType,
  ZIPType,
  DownloadService,
  fetchDataAndStreamResponse,
} from './DownloadService';

export class DefaultDownloadService implements DownloadService {
  async callFactoryService<TData, TMeta extends MetaBase>(
    downloadType: DownloadType,
    type: PDFType | XLSXType | ZIPType,
    properties: { data: TData[]; meta: TMeta; userRole: Role },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    fetchDataAndStreamResponse(downloadType, type, properties, req, res, next);
  }
}
