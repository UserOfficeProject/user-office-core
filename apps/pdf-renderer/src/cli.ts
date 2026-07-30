#!/usr/bin/env node
/* eslint-disable no-console */
import { readFileSync, writeFileSync } from 'fs';

import { renderPdf } from './renderPdf';
import { PageSize, RenderRequest } from './types';

/**
 * Command line entry point, so the rendering pipeline can be exercised without
 * a server, a database or a browser:
 *
 *   pdf-renderer --body body.hbs --data data.json --out proposal.pdf
 */

const USAGE = `
Usage: pdf-renderer --body <file> --data <file> --out <file> [options]

Required
  --body <file>      Handlebars/HTML body template
  --data <file>      JSON file with the template context
  --out <file>       Path to write the PDF to

Optional
  --header <file>    Handlebars/HTML running header template
  --footer <file>    Handlebars/HTML running footer template
  --section <file>   Handlebars/HTML template repeated per entry of --sections
  --sections <file>  JSON array of contexts for --section
  --page-size <name> a4 (default), a3, letter, ...
  --margin <expr>    Typst margin, e.g. "2cm" or "(top: 3cm, rest: 2cm)"
  --numbering <fmt>  Page number format, e.g. "1 / 1"
  --canvas-width <n> Pixel width the HTML was authored against (default 800)
  --font-path <dir>  Extra font directory, repeatable
  --dump-typst <f>   Also write the intermediate Typst source
  --dump-html <f>    Also write the intermediate HTML
`.trim();

function parseArgs(argv: string[]) {
  const single: Record<string, string> = {};
  const repeated: Record<string, string[]> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (!arg.startsWith('--')) {
      throw new Error(`Unexpected argument: ${arg}`);
    }

    const key = arg.slice(2);
    const value = argv[i + 1];

    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    i += 1;

    if (key === 'font-path') {
      repeated[key] = [...(repeated[key] ?? []), value];
    } else {
      single[key] = value;
    }
  }

  return { single, repeated };
}

function main(argv: string[]): number {
  if (argv.length === 0 || argv.includes('--help')) {
    console.log(USAGE);

    return argv.length === 0 ? 1 : 0;
  }

  const { single, repeated } = parseArgs(argv);

  for (const required of ['body', 'data', 'out']) {
    if (!single[required]) {
      throw new Error(`--${required} is required`);
    }
  }

  const read = (file: string) => readFileSync(file, 'utf-8');

  const request: RenderRequest = {
    templates: {
      body: read(single.body),
      header: single.header ? read(single.header) : undefined,
      footer: single.footer ? read(single.footer) : undefined,
      section: single.section ? read(single.section) : undefined,
    },
    data: JSON.parse(read(single.data)),
    sections: single.sections ? JSON.parse(read(single.sections)) : undefined,
    page: {
      size: single['page-size'] as PageSize | undefined,
      margin: single.margin,
      numbering: single.numbering,
      canvasWidthPx: single['canvas-width']
        ? Number(single['canvas-width'])
        : undefined,
    },
    fontPaths: repeated['font-path'],
  };

  const result = renderPdf(request);

  writeFileSync(single.out, result.pdf);

  if (single['dump-typst']) {
    writeFileSync(single['dump-typst'], result.typst);
  }

  if (single['dump-html']) {
    writeFileSync(single['dump-html'], result.html.join('\n'));
  }

  console.log(`Wrote ${single.out} (${result.pdf.length} bytes)`);

  return 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error((error as Error).message);
  process.exitCode = 1;
}
