import { NextFunction, Request, Response } from 'express';

import {
  canRenderLocally,
  getPdfEngine,
  isLocallyRenderable,
  isRendererAvailable,
} from './localRenderer';
import sendPdf from './sendPdf';
import { Role } from '../../models/Role';
import { MetaBase, PDFType } from '../service';

jest.mock('../service', () => {
  const actual = jest.requireActual('../service');

  return {
    ...actual,
    __esModule: true,
    default: jest.fn(),
  };
});

jest.mock('./localRenderer', () => {
  const actual = jest.requireActual('./localRenderer');

  return {
    ...actual,
    renderLocalPdf: jest.fn(() => Buffer.from('%PDF-1.7 fake')),
  };
});

const callFactoryService = jest.requireMock('../service').default;
const { renderLocalPdf } = jest.requireMock('./localRenderer');

const meta: MetaBase = {
  collectionFilename: 'proposals.pdf',
  singleFilename: 'proposal_1.pdf',
};

const userRole = { id: 1, shortCode: 'user_officer' } as Role;

const withTemplate = (id: number) => ({
  proposal: { primaryKey: id },
  pdfTemplate: { templateData: '<h1>{{proposal.primaryKey}}</h1>' },
});

const makeResponse = () => {
  const headers: Record<string, string> = {};

  return {
    headers,
    setHeader: jest.fn((name: string, value: string) => {
      headers[name] = value;
    }),
    send: jest.fn(),
  } as unknown as Response & { headers: Record<string, string> };
};

const req = {} as Request;
const next = jest.fn() as NextFunction;

describe('getPdfEngine', () => {
  const original = process.env.PDF_ENGINE;

  afterEach(() => {
    process.env.PDF_ENGINE = original;
  });

  it('defaults to the local typst engine', () => {
    delete process.env.PDF_ENGINE;

    expect(getPdfEngine()).toBe('typst');
  });

  it('can be pinned back to the factory service', () => {
    process.env.PDF_ENGINE = 'factory';

    expect(getPdfEngine()).toBe('factory');
  });

  it('ignores an unrecognised value', () => {
    process.env.PDF_ENGINE = 'wkhtmltopdf';

    expect(getPdfEngine()).toBe('typst');
  });
});

describe('isLocallyRenderable', () => {
  afterEach(() => {
    delete process.env.PDF_ENGINE;
  });

  it('accepts proposals that all carry a template', () => {
    expect(
      isLocallyRenderable(PDFType.PROPOSAL, [withTemplate(1), withTemplate(2)])
    ).toBe(true);
  });

  it('accepts experiment safety documents', () => {
    expect(
      isLocallyRenderable(PDFType.EXPERIMENT_SAFETY, [withTemplate(1)])
    ).toBe(true);
  });

  it('rejects the request when any entity has no template', () => {
    expect(
      isLocallyRenderable(PDFType.PROPOSAL, [withTemplate(1), { proposal: {} }])
    ).toBe(false);
  });

  it('rejects a template with an empty body', () => {
    expect(
      isLocallyRenderable(PDFType.PROPOSAL, [
        { pdfTemplate: { templateData: '' } },
      ])
    ).toBe(false);
  });

  it('rejects an empty request', () => {
    expect(isLocallyRenderable(PDFType.PROPOSAL, [])).toBe(false);
  });

  it('rejects types the local engine does not cover', () => {
    expect(isLocallyRenderable(PDFType.SAMPLE, [withTemplate(1)])).toBe(false);
    expect(isLocallyRenderable(PDFType.SHIPMENT_LABEL, [withTemplate(1)])).toBe(
      false
    );
  });

  it('rejects everything when the engine is pinned to the factory', () => {
    process.env.PDF_ENGINE = 'factory';

    expect(isLocallyRenderable(PDFType.PROPOSAL, [withTemplate(1)])).toBe(
      false
    );
  });
});

describe('renderer availability', () => {
  it('loads the renderer package, so the repository is wired up', () => {
    expect(isRendererAvailable()).toBe(true);
  });

  it('is required on top of the request being renderable', () => {
    // Both must hold. isLocallyRenderable is the request shape, availability is
    // whether the built package could be loaded at all.
    expect(canRenderLocally(PDFType.PROPOSAL, [withTemplate(1)])).toBe(
      isLocallyRenderable(PDFType.PROPOSAL, [withTemplate(1)]) &&
        isRendererAvailable()
    );
  });
});

describe('sendPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    renderLocalPdf.mockReturnValue(Buffer.from('%PDF-1.7 fake'));
  });

  it('renders locally and does not call the factory service', async () => {
    const res = makeResponse();

    await sendPdf(
      PDFType.PROPOSAL,
      { data: [withTemplate(1)], meta, userRole },
      req,
      res,
      next
    );

    expect(renderLocalPdf).toHaveBeenCalledTimes(1);
    expect(callFactoryService).not.toHaveBeenCalled();
    expect(res.send).toHaveBeenCalledWith(Buffer.from('%PDF-1.7 fake'));
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('uses the single filename for one entity', async () => {
    const res = makeResponse();

    await sendPdf(
      PDFType.PROPOSAL,
      { data: [withTemplate(1)], meta, userRole },
      req,
      res,
      next
    );

    expect(res.headers['x-download-filename']).toBe('proposal_1.pdf');
  });

  it('uses the collection filename for several entities', async () => {
    const res = makeResponse();

    await sendPdf(
      PDFType.PROPOSAL,
      { data: [withTemplate(1), withTemplate(2)], meta, userRole },
      req,
      res,
      next
    );

    expect(res.headers['x-download-filename']).toBe('proposals.pdf');
  });

  it('omits the filename headers on a preview, which has no filename', async () => {
    const res = makeResponse();

    await sendPdf(
      PDFType.PROPOSAL,
      {
        data: [withTemplate(1)],
        meta: { collectionFilename: '', singleFilename: '' },
        userRole,
      },
      req,
      res,
      next
    );

    expect(res.headers['Content-Disposition']).toBeUndefined();
    expect(res.headers['content-type']).toBe('application/pdf');
  });

  it('delegates to the factory service for types it does not handle', async () => {
    const res = makeResponse();

    await sendPdf(
      PDFType.SAMPLE,
      { data: [withTemplate(1)], meta, userRole },
      req,
      res,
      next
    );

    expect(renderLocalPdf).not.toHaveBeenCalled();
    expect(callFactoryService).toHaveBeenCalledTimes(1);
  });

  it('falls back to the factory service when the local render throws', async () => {
    const res = makeResponse();
    renderLocalPdf.mockImplementation(() => {
      throw new Error('typst compilation failed');
    });

    await sendPdf(
      PDFType.PROPOSAL,
      { data: [withTemplate(1)], meta, userRole },
      req,
      res,
      next
    );

    expect(callFactoryService).toHaveBeenCalledTimes(1);
    expect(res.send).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
