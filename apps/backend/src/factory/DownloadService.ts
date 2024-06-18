import { Request, Response, NextFunction } from 'express';

import { Role } from '../models/Role';

export enum DownloadType {
  PDF = 'pdf',
  XLSX = 'xlsx',
  ZIP = 'zip',
}

export enum XLSXType {
  PROPOSAL = 'proposal',
  Fap = 'fap',
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
