# pdf-renderer

Turns a Handlebars/HTML template plus a data object into a PDF. No browser, no
subprocess, no network access.

```
Handlebars template + data
  --> HTML           handlebars
  --> Typst markup   dom-typst
  --> PDF            @myriaddreamin/typst-ts-node-compiler
```

This package knows nothing about proposals, HTTP or the database. It is the
rendering half of the PDF feature; the authoring UI and the download endpoints
live in `apps/frontend` and `apps/backend`.

## Library use

```ts
import { renderPdf } from '@user-office-core/pdf-renderer';

const { pdf, html, typst } = renderPdf({
  templates: {
    body: '<h1>{{proposal.title}}</h1>',
    header: '<p>{{proposal.proposalId}}</p>',
    footer: '<p>Page <span class="pageNumber"></span></p>',
  },
  data: { proposal: { title: 'A study', proposalId: '123' } },
  page: { size: 'a4', numbering: '1 / 1' },
  fontPaths: ['../backend/fonts'],
});
```

`html` and `typst` are the intermediate stages, returned for debugging.

## Command line use

```sh
npm run render -- \
  --body  src/__tests__/fixtures/proposal-body.hbs \
  --data  data.json \
  --out   proposal.pdf \
  --dump-typst proposal.typ
```

`--help` lists every option.

## What each stage does

| Stage | Entry point | Notes |
| --- | --- | --- |
| Handlebars -> HTML | `renderHtml` | Isolated Handlebars environment, no global state. Helper set matches the one the factory service registered. |
| HTML -> Typst | `htmlToTypst` | `dom-typst` maps elements and CSS. Around it: `data:` URL images become Typst assets, and the Chromium page-number spans become Typst counters. |
| Typst assembly | `buildTypstDocument` | Page geometry, running header and footer, section page breaks. |
| Typst -> PDF | `compileTypst` | Native addon, in-process. Assets are handed over as in-memory shadow files, nothing is written to disk. |

## Known gaps against the old browser engine

- `<img src="http...">` is dropped. Only `data:` URLs are embedded, because
  there is no browser to fetch remote assets. Use the `$readAsBase64` helper.
- CSS `break-before: page` and `break-inside: avoid` are not translated. Use one
  section per page instead.
- No table of contents or PDF outline. The old engine derived it from
  `data-book-index` attributes after Chromium had laid the pages out.
- `colspan` and `rowspan` on tables are not supported by the converter.
- Flexbox and float layout are approximated. The converter maps CSS to Typst
  blocks, which is not a full layout engine.

## Tests

```sh
npm test
```

The end-to-end tests in `src/__tests__` run the templates that the frontend
seeds a new PDF template with, so a regression in the default template shows up
here rather than in the browser.
