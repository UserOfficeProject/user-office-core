import { renderHtml } from './handlebars/renderHtml';
import {
  CollectionRenderRequest,
  DocumentRequest,
  RenderRequest,
  RenderResult,
} from './types';
import { buildTypstDocument, DocumentParts } from './typst/buildDocument';
import { compileTypst } from './typst/compile';

/**
 * The entry points of the renderer.
 *
 * Handlebars templates + data in, PDF out. Synchronous, single process, no
 * browser and no network access.
 */

function renderDocument(document: DocumentRequest): DocumentParts {
  const { templates, data, sections = [] } = document;

  if (!templates?.body) {
    throw new Error('A body template is required');
  }

  return {
    body: renderHtml(templates.body, data),
    header: templates.header ? renderHtml(templates.header, data) : undefined,
    footer: templates.footer ? renderHtml(templates.footer, data) : undefined,
    sections: templates.section
      ? sections.map((section) =>
          renderHtml(templates.section as string, section)
        )
      : [],
  };
}

/**
 * Renders several documents into a single PDF.
 *
 * Each document keeps its own running header and footer and starts on a new
 * page. Page numbers run continuously across the collection.
 */
export function renderPdfCollection(
  request: CollectionRenderRequest
): RenderResult {
  const { documents, page, fontPaths } = request;

  if (!documents?.length) {
    throw new Error('At least one document is required');
  }

  const parts = documents.map(renderDocument);
  const typstDocument = buildTypstDocument(parts, page);

  const pdf = compileTypst(typstDocument.source, {
    fontPaths,
    assets: typstDocument.assets,
  });

  return {
    pdf,
    html: parts.map((part) => part.body),
    typst: typstDocument.source,
  };
}

/** Renders one document to a PDF. */
export function renderPdf(request: RenderRequest): RenderResult {
  const { templates, data, sections, page, fontPaths } = request;

  return renderPdfCollection({
    documents: [{ templates, data, sections }],
    page,
    fontPaths,
  });
}
