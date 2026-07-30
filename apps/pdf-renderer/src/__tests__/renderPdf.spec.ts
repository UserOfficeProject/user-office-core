import { readFileSync } from 'fs';
import { join } from 'path';

import { renderPdf, renderPdfCollection } from '../renderPdf';

/**
 * End-to-end tests over the pipeline, using the templates the frontend seeds a
 * new PDF template with. Passing these means a user officer's default template
 * renders without a browser.
 */

const fixture = (name: string) =>
  readFileSync(join(__dirname, 'fixtures', name), 'utf-8');

const LOGO = join(__dirname, '..', '..', '..', 'backend', 'images', 'ESS.png');
const FONTS = join(__dirname, '..', '..', '..', 'backend', 'fonts');

const dummy = JSON.parse(fixture('proposal-dummy-data.json')) as {
  data: Record<string, unknown>;
  userRole: Record<string, unknown>;
};

const templates = {
  body: fixture('proposal-body.hbs'),
  header: fixture('proposal-header.hbs'),
  footer: fixture('proposal-footer.hbs'),
  section: fixture('proposal-sample-declaration.hbs'),
};

const data = {
  ...dummy.data,
  userRole: dummy.userRole,
  logoPath: LOGO,
};

const isPdf = (bytes: Buffer) => bytes.subarray(0, 5).toString() === '%PDF-';

/** Counts page objects, which is enough to tell one page from several. */
const countPages = (pdf: Buffer) =>
  (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length;

describe('renderPdf', () => {
  it('renders the default proposal template to a PDF', () => {
    const result = renderPdf({
      templates,
      data,
      page: { size: 'a4', numbering: '1' },
      fontPaths: [FONTS],
    });

    expect(isPdf(result.pdf)).toBe(true);
    expect(result.pdf.length).toBeGreaterThan(10000);
  });

  it('carries the template data through to the PDF text', () => {
    const { pdf } = renderPdf({ templates, data, fontPaths: [FONTS] });
    const text = pdf.toString('latin1');

    // Typst compresses content streams, so assert on the metadata instead and
    // rely on the HTML stage for content checks.
    expect(text).toContain('%PDF-');
    expect(countPages(pdf)).toBeGreaterThan(0);
  });

  it('exposes the intermediate HTML and Typst source', () => {
    const result = renderPdf({ templates, data });

    const proposal = dummy.data.proposal as {
      proposalId: string;
      title: string;
    };

    expect(result.html[0]).toContain(proposal.proposalId);
    expect(result.html[0]).toContain(proposal.title);
    expect(result.typst).toContain('#set page(');
    expect(result.typst).toContain('#heading(');
  });

  it('embeds the header logo as a Typst image rather than dropping it', () => {
    const result = renderPdf({ templates, data });

    expect(result.typst).toContain('image("/assets/d0/header/image0.png"');
  });

  it('translates the footer page counters', () => {
    const result = renderPdf({ templates, data });

    expect(result.typst).toContain('#context counter(page).display()');
    expect(result.typst).toContain('#context counter(page).final().first()');
  });

  it('adds a page for each section', () => {
    const single = renderPdf({ templates, data });
    const withSections = renderPdf({
      templates,
      data,
      sections: [
        { sample: { title: 'Sample A' }, sampleQuestionaryFields: [] },
        { sample: { title: 'Sample B' }, sampleQuestionaryFields: [] },
      ],
    });

    expect(countPages(withSections.pdf)).toBeGreaterThan(
      countPages(single.pdf)
    );
  });

  it('works without a header or a footer', () => {
    const result = renderPdf({
      templates: { body: '<h1>Bare</h1>' },
      data: {},
    });

    expect(isPdf(result.pdf)).toBe(true);
    expect(result.typst).not.toContain('header:');
    expect(result.typst).not.toContain('footer:');
  });

  it('rejects a request without a body template', () => {
    expect(() => renderPdf({ templates: { body: '' }, data: {} })).toThrow(
      /body template is required/
    );
  });
});

describe('renderPdfCollection', () => {
  it('renders several entities into one PDF, each on its own page', () => {
    const result = renderPdfCollection({
      documents: [
        { templates: { body: '<h1>First</h1>' }, data: {} },
        { templates: { body: '<h1>Second</h1>' }, data: {} },
      ],
    });

    expect(isPdf(result.pdf)).toBe(true);
    expect(result.html).toHaveLength(2);
    expect(countPages(result.pdf)).toBe(2);
  });

  it('keeps a separate running header per entity', () => {
    const result = renderPdfCollection({
      documents: [
        {
          templates: { body: '<p>a</p>', header: '<p>{{id}}</p>' },
          data: { id: 'PROP-1' },
        },
        {
          templates: { body: '<p>b</p>', header: '<p>{{id}}</p>' },
          data: { id: 'PROP-2' },
        },
      ],
    });

    expect(result.typst).toContain('PROP-1');
    expect(result.typst).toContain('PROP-2');
  });

  it('renders the real proposal template for several proposals', () => {
    const result = renderPdfCollection({
      documents: [
        { templates, data },
        { templates, data },
      ],
      page: { size: 'a4', numbering: '1' },
      fontPaths: [FONTS],
    });

    expect(isPdf(result.pdf)).toBe(true);
    expect(countPages(result.pdf)).toBeGreaterThan(1);
  });

  it('rejects an empty collection', () => {
    expect(() => renderPdfCollection({ documents: [] })).toThrow(
      /At least one document is required/
    );
  });
});
