# PDF generation

How a proposal or experiment safety PDF is produced, and which library does
each step.

---

## Why this changed

The old pipeline generated PDFs inside a headless Chromium instance. Templates
were HTML, Handlebars filled them in, `paged.js` paginated them in the browser,
and Puppeteer called `page.pdf()`. That put a browser on the critical path:

- The factory container needed `SYS_ADMIN` to run Chromium, or a Browserless
  cluster to connect to.
- CI had to pull and run the factory image so Cypress could drive a real browser
  through the preview and download flows.
- Rendering shared a process with page counting, table-of-contents scripts and
  PDF merging, so a failure anywhere looked the same from outside.

The replacement uses Typst as the PDF engine. Nothing in the render path needs a
browser, a subprocess or the network.

---

## The two features, kept separate

The PDF feature is now two independent pieces.

Authoring and delivery, which uses a browser because a person is using it:

- template editing in the UI
- template storage in Postgres
- preview and download endpoints

Rendering, which is a pure function:

- input: Handlebars templates and a data object
- output: PDF bytes
- no express, no database, no DOM, no Chromium

The renderer lives in `apps/pdf-renderer` and can be called as a library, from a
CLI, or from tests. It does not know what a proposal is.

---

## Pipeline

### Authoring

```
User officer in the browser
  |
  | CodeMirror HTML editor, tabs for
  | Body / Header / Footer / Sample Declaration / Dummy Data
  | apps/frontend/src/components/template/pdf/*/PdfTemplateEditor.tsx
  v
GraphQL mutation  updateProposalPdfTemplate
  |
  v
Postgres  pdf_templates
  templateData, templateHeader, templateFooter,
  templateSampleDeclaration, dummyData
```

Templates are stored as raw HTML with Handlebars expressions. Nothing about the
storage format changed, so existing templates keep working.

### Preview

```
PdfTemplateEditorViewer.tsx
  |
  | GET /preview/pdf/proposal?pdfTemplateId=N
  v
apps/backend  src/middlewares/factory/pdf/preview.ts
  |
  | loads the template and its dummyData
  v
sendPdf  ->  rendering pipeline below
  |
  | PDF bytes
  v
react-pdf (pdfjs-dist) renders the PDF to a canvas in the editor
```

The browser here only displays the finished PDF. It takes no part in producing
it.

### Download

```
Proposal table -> Download PDF
  |
  | GET /download/pdf/proposal/:keys
  v
apps/backend  src/middlewares/factory/pdf/download.ts
  |
  | collects proposal data, questionary answers, samples, reviews
  v
sendPdf  ->  rendering pipeline below
  |
  | PDF bytes with Content-Disposition
  v
Browser download
```

### Rendering

This is the part with no browser in it. Every step names the library that does
the work.

```
Handlebars templates + data object
  |
  |  handlebars 4.7
  |  isolated environment, PDF helper set registered on it
  |  apps/pdf-renderer/src/handlebars/renderHtml.ts
  v
HTML string
  |
  |  pre-pass, plain regex, no library
  |  - data: URL images pulled out as Typst assets
  |  - pageNumber / totalPages spans turned into Typst counters
  |  - CSS colour functions tightened for the converter
  |  apps/pdf-renderer/src/typst/htmlToTypst.ts
  v
HTML string, normalised
  |
  |  dom-typst 0.1
  |  native Rust addon: element mapping, CSS inlining, tables, inline SVG
  v
Typst markup fragment
  |
  |  assembly, no library
  |  page geometry, running header and footer, section and document page breaks
  |  apps/pdf-renderer/src/typst/buildDocument.ts
  v
Typst document source (.typ)
  |
  |  @myriaddreamin/typst-ts-node-compiler 0.7
  |  native Rust addon wrapping the Typst compiler, in process
  |  assets passed in as in-memory shadow files
  |  apps/pdf-renderer/src/typst/compile.ts
  v
PDF bytes
```

### Library summary

| Step             | Library                                 | Version  | Licence          |
| ---------------- | --------------------------------------- | -------- | ---------------- |
| Template editing | `@uiw/react-codemirror`                 | existing | MIT              |
| Preview display  | `react-pdf` / `pdfjs-dist`              | existing | MIT / Apache-2.0 |
| Template -> HTML | `handlebars`                            | 4.7      | MIT              |
| HTML -> Typst    | `dom-typst`                             | 0.1      | MIT              |
| Typst -> PDF     | `@myriaddreamin/typst-ts-node-compiler` | 0.7      | Apache-2.0       |

Both native addons ship prebuilt binaries for linux x64 and arm64 (gnu and
musl), macOS x64 and arm64, and Windows. No Rust toolchain is needed to install
or build.

---

## What still uses the factory service

`sendPdf` in `apps/backend/src/factory/pdf/sendPdf.ts` is the only place that
decides. It renders locally when the request is for a proposal or experiment
safety PDF and every entity in it carries a stored template. Everything else
goes to the factory service exactly as before:

- XLSX exports
- ZIP attachment bundles
- sample PDFs and shipment label PDFs, whose Handlebars templates live inside
  the factory image rather than in this repository
- proposals with no custom template, which the factory builds from its own
  built-in templates
- appending user-uploaded PDF and image attachments to a proposal PDF, which
  needs the factory's file datasource and its `muhammara` merge step

A local render that throws also falls back to the factory service, so a template
the new engine cannot handle still produces a PDF. The failure is logged.

Set `PDF_ENGINE=factory` to send every PDF to the factory service.

---

## Behaviour differences

Worth knowing before reviewing a rendered document.

- Remote images are dropped. `<img src="https://...">` only worked because a
  browser fetched it. Use the `$readAsBase64` helper, which the default header
  template already does.
- CSS `break-before: page` and `break-inside: avoid` are not translated. Put
  content in a section to force a page break.
- No table of contents or PDF outline. The old engine derived it from
  `data-book-index` attributes after Chromium had laid out the pages.
- Page numbers run continuously across a multi-proposal download, and the total
  is the total for the collection. The old engine merged separate PDFs, so each
  proposal counted its own pages.
- Flexbox and float layout are approximated. The converter maps CSS onto Typst
  blocks; it is not a browser layout engine.
- `colspan` and `rowspan` are not supported by the converter.

---

## Running the pipeline on its own

No server, no database, no browser:

```sh
cd apps/pdf-renderer
npm run render -- \
  --body  src/__tests__/fixtures/proposal-body.hbs \
  --data  data.json \
  --out   proposal.pdf \
  --dump-typst proposal.typ
```

`--dump-typst` and `--dump-html` write the intermediate stages, which is the
quickest way to tell whether a rendering problem came from Handlebars, the HTML
conversion or the Typst compile.

---

## Tests

| Suite                                               | What it covers                                                                 |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/pdf-renderer/src/handlebars/*.spec.ts`        | helper behaviour, template error reporting                                     |
| `apps/pdf-renderer/src/typst/*.spec.ts`             | HTML conversion, CSS fixes, image sizing, document assembly, compilation       |
| `apps/pdf-renderer/src/__tests__/renderPdf.spec.ts` | end-to-end renders of the templates the frontend seeds a new PDF template with |
| `apps/backend/src/factory/pdf/answerMap.spec.ts`    | the `answers` map templates read                                               |
| `apps/backend/src/factory/pdf/sendPdf.spec.ts`      | which engine handles a request, and the fallback                               |

Run them with `npm run test:pdf-renderer` and `npm run test:backend` from the
repository root.
