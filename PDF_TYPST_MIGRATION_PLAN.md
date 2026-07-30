# Plan: replace the browser-based PDF engine with Typst

Working document. Updated as steps complete. Status keys: TODO / WIP / DONE / SKIPPED.

## 1. Current pipeline (as found)

Confirmed by reading this repo plus the `UserOfficeProject/user-office-factory` sources.

- Browser UI (`apps/frontend`)
  - `src/components/template/pdf/{proposal,experimentSafety}/PdfTemplateEditor.tsx` — CodeMirror
    HTML editor with tabs Body / Header / Footer / Sample Declaration / Dummy Data.
  - Templates are stored in Postgres (`ProposalPdfTemplateDataSource`,
    `ExperimentSafetyPdfTemplateDataSource`) as raw HTML-with-Handlebars strings.
  - `PdfTemplateEditorViewer.tsx` fetches `/preview/pdf/proposal?pdfTemplateId=N` and renders the
    returned PDF blob with `react-pdf` (pdf.js).
- Backend (`apps/backend`)
  - `src/middlewares/factory/pdf/download.ts` and `.../preview.ts` collect data,
    then `src/factory/service.ts` POSTs `{data, meta, userRole}` to
    `$USER_OFFICE_FACTORY_ENDPOINT/pdf/<type>` and pipes the response to the client.
  - No rendering happens in this repo today.
- Factory service (separate repo, `ghcr.io/userofficeproject/user-office-factory`)
  - `handlebars` compiles the stored template against the payload -> HTML string.
  - `paged.js` is injected into that HTML plus a table-of-contents script
    (`src/util/pdfHtmlScript.ts`, `insertScriptInTop/Bottom`).
  - `puppeteer` loads the HTML in Chromium and calls `page.pdf()`
    (`src/pdf/index.ts`). Either a local Chromium (needs `SYS_ADMIN`) or a remote
    Browserless cluster via `BROWSER_WS_ENDPOINT` (`k8s/browserless/`).
  - `muhammara` merges the per-part PDFs and writes the outline.
- CI (`.github/workflows/test-build.yml`)
  - Resolves a `user-office-factory` image tag and runs it as a service so Cypress
    can drive the preview/download flow. This is the Chromium dependency we are removing.

## 2. Target pipeline

Two features, deliberately separated.

- Feature A — authoring and delivery (keeps the browser)
  - unchanged CodeMirror HTML/Handlebars editor, unchanged Postgres storage,
    unchanged `react-pdf` preview, unchanged download endpoints.
- Feature B — rendering (no browser anywhere)
  - a standalone package: `apps/pdf-renderer`.
  - pure input/output: `{ templates, data }` in, PDF `Buffer` out.
  - no express, no database, no DOM, no Chromium.
  - stages: Handlebars -> HTML -> Typst markup -> PDF.

## 3. Library choices (verified against live registries and a local smoke test)

| Stage                | Library                                 | Version | Why                                                                            |
| -------------------- | --------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| Handlebars -> HTML   | `handlebars`                            | 4.7.x   | same engine the factory uses, so stored templates keep working                 |
| HTML -> Typst markup | `dom-typst`                             | 0.1.14  | napi-rs native addon, prebuilt binaries, MIT, purpose-built for this direction |
| Typst -> PDF         | `@myriaddreamin/typst-ts-node-compiler` | 0.7.0   | official typst.ts Node binding, in-process, prebuilt binaries, Apache-2.0      |

Smoke test already run in `/tmp/typst-probe`: HTML with headings, emphasis and a table
converted to Typst and compiled to a 16 kB `%PDF-1.7` file with no browser present.

Rejected: `typst` npm package (last release 2023, CLI shell-out), `html2typst`
(not on npm), online converters (network dependency).

## 4. Steps

1. DONE — branch `feat/typst-pdf-pipeline` off `develop`.
2. DONE — scaffolded `apps/pdf-renderer` (package.json, tsconfig, jest, eslint, prettier
   matching the other apps).
3. DONE — installed and pinned the three libraries.
4. DONE — ported the Handlebars helper set from the factory: `$eq`, `$notEq`, `$in`,
   `$sum`, `$join`, `$or`, `$readableDate`, `$readAsBase64`, `$utcDate`, `$attachment`,
   `$debug`. Registered on an isolated environment rather than the global Handlebars
   singleton. `$barcode` was skipped: it only appears in shipment-label templates, which
   stay on the factory service, and it would pull in `jsbarcode` plus the deprecated
   `xmldom`.
5. DONE — stage 1: `renderHtml(template, data)`. Parses eagerly so a template syntax
   error is reported separately from a data or helper error.
6. DONE — stage 2: `htmlToTypst(html, options)`. Needed more than a thin wrapper, see
   section 7.
7. DONE — stage 3: `buildTypstDocument(documents, page)`. Takes a list of documents, not
   one, so a multi-proposal download is a single Typst document with a per-entity running
   header instead of a merge of separate PDFs.
8. DONE — stage 4: `compileTypst(source, options)`. Compilers are cached per font
   configuration; assets are mapped as shadow files and unmapped afterwards.
9. DONE — `renderPdf` and `renderPdfCollection`.
10. DONE — CLI at `src/cli.ts`, with `--dump-typst` and `--dump-html` for debugging.
11. DONE — 71 tests: per stage, plus end-to-end renders of the real default templates
    taken as fixtures from `PdfTemplateDefaultData.tsx`.
12. DONE — `apps/backend/src/factory/pdf/sendPdf.ts` is the single dispatch point, and
    `localRenderer.ts` builds the render request from proposal or experiment safety data.
    `answerMap.ts` ports the `answers` map from the factory.
13. DONE — proposal and experiment safety download and preview go through `sendPdf`.
    Sample, shipment label, XLSX and ZIP still call `callFactoryService` directly.
14. DONE — `PDF_ENGINE` (`typst` default, `factory` to revert) and `PDF_PAGE_SIZE`,
    documented in `apps/backend/example.development.env`.
15. DONE — 23 backend tests for the engine decision, the filename headers and the
    fallback, plus the answer map.
16. DONE — report at `documentation/docs/developer-guide/pdf_generation.md`, added to the
    mkdocs nav, and the factory description in `architecture.md` corrected.
17. DONE — lint, typecheck and both unit suites pass.
18. DONE — committed per checkpoint.

Build wiring, which was not in the original plan:

- the renderer is a `file:../pdf-renderer` dependency of the backend, so it must be
  installed and built first. Added `install:pdf-renderer`, `build:pdf-renderer`,
  `lint:pdf-renderer` and `test:pdf-renderer` to the root scripts, and put the renderer
  first in `postinstall`.
- `apps/backend/Dockerfile` builds the renderer as a sibling directory in the build stage
  and copies its `build/` and `node_modules/` into the runtime stage, because the two
  native addons cannot be hoisted.
- `.github/workflows/test-build.yml` installs and builds the renderer before the backend.

## 4a. Problems found and how they were handled

Recorded because they are the parts a reviewer is most likely to question.

- `dom-typst` loses colour channels when a colour function with spaces appears in a CSS
  shorthand: `border-bottom: 2px solid rgb(0, 163, 218)` becomes `rgb(0,,`, which is not
  valid Typst. It also mis-parses a declaration split across lines, which the default
  header template has. Both are fixed by a CSS normalisation pre-pass that collapses
  whitespace and tightens colour functions. Covered by tests.
- `<img>` is converted to the alt text, so a logo would be lost. Data URL images are now
  extracted before conversion, passed to the compiler as shadow files, and referenced
  with `#image(...)`. Width comes from the `width`/`height` attributes, then inline style,
  then the intrinsic size read out of the PNG, JPEG or GIF header. Without that last
  fallback Typst scales an image to the full page width.
- `<span class="pageNumber">` and `<span class="totalPages">` were filled in by Chromium.
  They are now translated to `#context counter(page).display()` and
  `#context counter(page).final().first()`.
- `<title>` text leaked into the body, because the converter strips the tag but keeps its
  text. `<title>`, `<script>` and `<noscript>` are removed first.
- All of these work through alphanumeric text tokens. Anything with punctuation gets
  escaped by the converter.

## 5. Explicitly out of scope

Recorded so the reviewer knows what still needs the factory service.

- XLSX and ZIP generation — untouched, still proxied to the factory.
- Sample PDF and shipment-label PDF — their Handlebars templates live inside the factory
  image, not in this repo, so they cannot be ported here without moving those files too.
- Appending user-uploaded PDF/image attachments to a proposal PDF — needs the factory's
  file datasource and `muhammara` merge step. A browser-free replacement (`pdf-lib`) is
  noted as follow-up in the report.
- Auto-generated (non-custom-template) proposal PDFs.

## 6. Checkpoints

- C1: package scaffolded and libraries installed. Commit `026ce0f`.
- C2: render stages plus public API, with tests passing. Commit `c72086c`.
- C3: backend wired up with tests. Commit `8340b36`.
- C4: report and docs.

## 7. Follow-up work this leaves open

- Appending user-uploaded attachments to a proposal PDF. Needs the file datasource and a
  merge step; `pdf-lib` would keep it browser-free.
- Table of contents and PDF outline. Typst can produce both natively from headings, which
  would be cleaner than the old `data-book-index` scraping, but it needs a template
  convention rather than a code change alone.
- Porting the sample and shipment-label templates out of the factory image, which would
  let those types move over too.
- Translating CSS page-break properties, so existing templates that rely on
  `break-before: page` keep their layout.
- Once nothing needs it, dropping the factory service from `docker-compose.yml` and from
  the CI image resolution in `test-build.yml`.
