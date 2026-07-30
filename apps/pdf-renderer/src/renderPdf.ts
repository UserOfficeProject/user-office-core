import { renderHtml } from './handlebars/renderHtml';
import { RenderRequest, RenderResult } from './types';
import { buildTypstDocument } from './typst/buildDocument';
import { compileTypst } from './typst/compile';

/**
 * The one entry point of the renderer.
 *
 * Handlebars template + data in, PDF out. Synchronous, single process, no
 * browser and no network access.
 */
export function renderPdf(request: RenderRequest): RenderResult {
  const { templates, data, sections = [], page, fontPaths } = request;

  if (!templates?.body) {
    throw new Error('A body template is required');
  }

  const body = renderHtml(templates.body, data);

  const document = buildTypstDocument(
    {
      body,
      header: templates.header ? renderHtml(templates.header, data) : undefined,
      footer: templates.footer ? renderHtml(templates.footer, data) : undefined,
      sections: templates.section
        ? sections.map((section) =>
            renderHtml(templates.section as string, section)
          )
        : [],
    },
    page
  );

  const pdf = compileTypst(document.source, {
    fontPaths,
    assets: document.assets,
  });

  return { pdf, html: body, typst: document.source };
}
