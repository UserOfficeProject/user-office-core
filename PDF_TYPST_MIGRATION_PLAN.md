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

| Stage | Library | Version | Why |
| --- | --- | --- | --- |
| Handlebars -> HTML | `handlebars` | 4.7.x | same engine the factory uses, so stored templates keep working |
| HTML -> Typst markup | `dom-typst` | 0.1.14 | napi-rs native addon, prebuilt binaries, MIT, purpose-built for this direction |
| Typst -> PDF | `@myriaddreamin/typst-ts-node-compiler` | 0.7.0 | official typst.ts Node binding, in-process, prebuilt binaries, Apache-2.0 |

Smoke test already run in `/tmp/typst-probe`: HTML with headings, emphasis and a table
converted to Typst and compiled to a 16 kB `%PDF-1.7` file with no browser present.

Rejected: `typst` npm package (last release 2023, CLI shell-out), `html2typst`
(not on npm), online converters (network dependency).

## 4. Steps

1. TODO — create branch `feat/typst-pdf-pipeline` off `develop`.
2. TODO — scaffold `apps/pdf-renderer` (package.json, tsconfig, jest, eslint, prettier
   matching the other apps).
3. TODO — install and pin the three libraries.
4. TODO — port the Handlebars helper set from the factory so existing templates render
   identically: `$eq`, `$notEq`, `$in`, `$sum`, `$join`, `$or`, `$readableDate`,
   `$readAsBase64`, `$utcDate`, `$attachment`, `$barcode`, `$debug`.
5. TODO — stage 1: `renderHtml(template, data)` — Handlebars compile.
6. TODO — stage 2: `htmlToTypst(html, options)` — `dom-typst` wrapper with page size,
   canvas width and root font size options.
7. TODO — stage 3: `buildTypstDocument(...)` — assemble the `.typ` source: preamble,
   page setup, running header/footer, then the converted body.
8. TODO — stage 4: `compileTypst(typ)` — `NodeCompiler.pdf()` wrapper returning a Buffer.
9. TODO — `renderPdf(request)` — the single public entry point chaining 1-4.
10. TODO — CLI entry point so the pipeline can run with no server at all:
    `pdf-renderer --body body.hbs --data data.json --out out.pdf`.
11. TODO — unit tests per stage plus an end-to-end test that asserts a real PDF header
    and page count.
12. TODO — backend adapter `apps/backend/src/factory/localPdf.ts`: render in-process and
    stream, preserving `Content-Disposition` and `x-download-filename`.
13. TODO — route proposal and experiment-safety PDF download/preview through the adapter
    when a custom template exists; keep the factory call as the fallback path.
14. TODO — `PDF_ENGINE` env switch (`typst` default, `factory` to revert) documented in
    the example env files.
15. TODO — backend unit tests for the routing decision and the adapter.
16. TODO — architecture report `documentation/docs/developer-guide/pdf-generation.md`
    with the pipeline diagram and the library used at each step; add to mkdocs nav.
17. TODO — run lint, typecheck and the unit suites for both packages.
18. TODO — commit at each checkpoint.

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

- C1: package scaffolded and libraries installed.
- C2: three render stages plus public API, with tests passing.
- C3: backend wired up with tests.
- C4: report and docs.
