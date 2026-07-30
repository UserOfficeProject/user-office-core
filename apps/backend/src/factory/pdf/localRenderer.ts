import { join } from 'path';

import {
  DocumentRequest,
  PageSize,
  renderPdfCollection,
} from '@user-office-core/pdf-renderer';
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
 * Whether every entity in the request carries a template this renderer can use.
 *
 * All or nothing on purpose: a PDF that silently mixed two engines would be
 * harder to explain than one that falls back wholesale.
 */
export function canRenderLocally(type: PDFType, data: unknown[]): boolean {
  if (getPdfEngine() !== 'typst') {
    return false;
  }

  if (type !== PDFType.PROPOSAL && type !== PDFType.EXPERIMENT_SAFETY) {
    return false;
  }

  return data.length > 0 && data.every(hasTemplate);
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
      userRole,
      answers: extractAnswerMap(entity),
      logoPath: HEADER_LOGO_PATH,
      // Attachments are not appended by this engine, so no file metadata is
      // resolved. The $attachment helper then points the reader at the website.
      attachmentsFileMeta: [],
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
      userRole,
      logoPath: HEADER_LOGO_PATH,
      attachmentsFileMeta: [],
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
  const documents =
    type === PDFType.PROPOSAL
      ? (data as FullProposalPDFData[]).map((entity) =>
          proposalDocument(entity, userRole)
        )
      : (data as ExperimentSafetyPDFData[]).map((entity) =>
          experimentSafetyDocument(entity, userRole)
        );

  const started = Date.now();
  const { pdf } = renderPdfCollection({
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
