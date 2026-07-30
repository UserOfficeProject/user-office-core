import { join } from 'path';

import type { DocumentRequest, PageSize } from '@user-office-core/pdf-renderer';
import { logger } from '@user-office-software/duo-logger';

import { extractAnswerMap } from './answerMap';
import { ExperimentSafetyPDFData } from './experimentSafety';
import { FullProposalPDFData } from './proposal';
import { Role } from '../../models/Role';
import { PDFType } from '../service';

/**
 * Renders PDFs in this process, with no browser involved.
 *
 * This is the seam between the two halves of the PDF feature. The authoring UI
 * and the download endpoints stay where they are; only the engine changes. A
 * request is handled here when the entity has a user-officer defined template,
 * which is the case the browser engine was needed for. Anything else still goes
 * to the factory service.
 */

export type PdfEngine = 'typst' | 'factory';

type Renderer = typeof import('@user-office-core/pdf-renderer');

/**
 * `undefined` means not tried yet, `null` means it could not be loaded.
 */
let renderer: Renderer | null | undefined;

/**
 * Loads the renderer on first use rather than at import time.
 *
 * The renderer is a workspace package that has to be built, and it pulls in two
 * native addons. Importing it at module scope made the whole backend fail to
 * start when either was missing, because this module is reached from
 * `index.ts` through the factory middleware. Failing to render a PDF should
 * cost a PDF, not the API.
 */
function loadRenderer(): Renderer | null {
  if (renderer === undefined) {
    try {
      // A static import would be hoisted and run at boot, which is exactly what
      // this function exists to avoid. The renderer is synchronous, so a dynamic
      // import() is not an option either.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      renderer = require('@user-office-core/pdf-renderer') as Renderer;
      logger.logInfo('Local typst PDF renderer is available', {});
    } catch (error) {
      renderer = null;
      logger.logException(
        'Local typst PDF renderer could not be loaded, PDFs will use the factory service. Run "npm run build:pdf-renderer" from the repository root.',
        error
      );
    }
  }

  return renderer;
}

/** Whether the renderer could be loaded. */
export function isRendererAvailable(): boolean {
  return loadRenderer() !== null;
}

/** Forgets the cached load result. Exposed for tests. */
export function resetRenderer(): void {
  renderer = undefined;
}

/** Fonts bundled with the backend, so a template can name Calibri. */
const FONT_PATHS = [join(process.cwd(), 'fonts')];

/** Logo used when a header template asks for one and the payload has none. */
const HEADER_LOGO_PATH =
  process.env.HEADER_LOGO_PATH ?? join(process.cwd(), 'images', 'ESS.png');

const PAGE_SIZE = (process.env.PDF_PAGE_SIZE ?? 'a4') as PageSize;

/**
 * Which engine to use. `typst` renders locally, `factory` keeps every request
 * on the browser-based service.
 */
export function getPdfEngine(): PdfEngine {
  return process.env.PDF_ENGINE === 'factory' ? 'factory' : 'typst';
}

/** A PDF template as stored by the template editor. */
type StoredPdfTemplate = {
  templateData: string;
  templateHeader?: string | null;
  templateFooter?: string | null;
  templateSampleDeclaration?: string | null;
};

function hasTemplate(entity: unknown): entity is {
  pdfTemplate: StoredPdfTemplate;
} {
  const template = (entity as { pdfTemplate?: StoredPdfTemplate } | null)
    ?.pdfTemplate;

  return (
    typeof template?.templateData === 'string' && template.templateData !== ''
  );
}

/**
 * Whether the request itself is one the local engine covers: a supported type,
 * where every entity carries a usable template.
 *
 * All or nothing on purpose: a PDF that silently mixed two engines would be
 * harder to explain than one that falls back wholesale.
 */
export function isLocallyRenderable(type: PDFType, data: unknown[]): boolean {
  if (getPdfEngine() !== 'typst') {
    return false;
  }

  if (type !== PDFType.PROPOSAL && type !== PDFType.EXPERIMENT_SAFETY) {
    return false;
  }

  return data.length > 0 && data.every(hasTemplate);
}

/**
 * Whether this request should be rendered locally: the request has to be
 * supported and the renderer has to have loaded.
 */
export function canRenderLocally(type: PDFType, data: unknown[]): boolean {
  return isLocallyRenderable(type, data) && isRendererAvailable();
}

/**
 * Every template gets these on top of the entity data.
 *
 * `factoryBaseUrl` exists because templates written against the factory service
 * put it in a `<base href>`. Nothing here fetches a remote asset, so its only
 * job is to keep such a template rendering the same as before.
 */
function commonContext(): Record<string, unknown> {
  return {
    factoryBaseUrl: process.env.FACTORY_BASE_URL ?? '',
    logoPath: HEADER_LOGO_PATH,
    // Attachments are not appended by this engine, so no file metadata is
    // resolved. The $attachment helper then points the reader at the website.
    attachmentsFileMeta: [],
  };
}

function toDocument(
  entity: { pdfTemplate: StoredPdfTemplate },
  context: Record<string, unknown>,
  sections: Record<string, unknown>[]
): DocumentRequest {
  const { pdfTemplate } = entity;

  return {
    templates: {
      body: pdfTemplate.templateData,
      header: pdfTemplate.templateHeader ?? undefined,
      footer: pdfTemplate.templateFooter ?? undefined,
      section: pdfTemplate.templateSampleDeclaration ?? undefined,
    },
    data: context,
    sections,
  };
}

function proposalDocument(
  entity: FullProposalPDFData,
  userRole: Role
): DocumentRequest {
  return toDocument(
    entity as FullProposalPDFData & { pdfTemplate: StoredPdfTemplate },
    {
      ...entity,
      ...commonContext(),
      userRole,
      answers: extractAnswerMap(entity),
    },
    entity.samples as unknown as Record<string, unknown>[]
  );
}

function experimentSafetyDocument(
  entity: ExperimentSafetyPDFData,
  userRole: Role
): DocumentRequest {
  return toDocument(
    entity as ExperimentSafetyPDFData & { pdfTemplate: StoredPdfTemplate },
    {
      ...entity,
      ...commonContext(),
      userRole,
    },
    entity.experimentSamples as unknown as Record<string, unknown>[]
  );
}

/**
 * Renders one PDF covering every entity in the request.
 *
 * @throws when a template fails to render or to compile. Callers are expected
 * to fall back to the factory service rather than surface the error.
 */
export function renderLocalPdf(
  type: PDFType,
  data: unknown[],
  userRole: Role
): Buffer {
  const pdfRenderer = loadRenderer();

  if (!pdfRenderer) {
    throw new Error('The local PDF renderer is not available');
  }

  const documents =
    type === PDFType.PROPOSAL
      ? (data as FullProposalPDFData[]).map((entity) =>
          proposalDocument(entity, userRole)
        )
      : (data as ExperimentSafetyPDFData[]).map((entity) =>
          experimentSafetyDocument(entity, userRole)
        );

  const started = Date.now();
  const { pdf } = pdfRenderer.renderPdfCollection({
    documents,
    page: { size: PAGE_SIZE, numbering: '1' },
    fontPaths: FONT_PATHS,
  });

  logger.logInfo('Rendered PDF locally with the typst engine', {
    type,
    documents: documents.length,
    bytes: pdf.length,
    durationMs: Date.now() - started,
  });

  return pdf;
}
