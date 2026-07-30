import { PageOptions } from '../types';
import { htmlToTypst, TypstAsset } from './htmlToTypst';
import {
  DEFAULT_CANVAS_WIDTH_PX,
  DEFAULT_MARGIN,
  DEFAULT_PAGE_SIZE,
  DEFAULT_ROOT_FONT_SIZE_PX,
  PAGE_DIMENSIONS_PT,
} from './pageSizes';

/**
 * Stage 3 of the pipeline: converted HTML fragments -> one Typst document.
 *
 * This is where the page geometry, the running header and footer and the
 * section page breaks are decided. Everything the old engine expressed through
 * Chromium print options lives here instead.
 */

export interface DocumentParts {
  /** Rendered body HTML. */
  body: string;
  /** Rendered header HTML, repeated on every page. */
  header?: string;
  /** Rendered footer HTML, repeated on every page. */
  footer?: string;
  /** Rendered section HTML, each starting on a new page after the body. */
  sections?: string[];
}

export interface TypstDocument {
  source: string;
  assets: TypstAsset[];
}

/** Directory, relative to the workspace root, that holds the render assets. */
export const ASSET_DIR = 'assets';

/** Absolute path the assets are referenced by inside the Typst document. */
export const ASSET_ROOT = `/${ASSET_DIR}`;

function contentBlock(markup: string): string {
  // A content block keeps the markup out of the surrounding code context.
  return `[\n${markup.trim()}\n]`;
}

function fontList(fonts: string[]): string {
  const quoted = fonts.map((font) => `"${font.replace(/"/g, '')}"`);

  return quoted.length === 1 ? quoted[0] : `(${quoted.join(', ')})`;
}

/**
 * Builds the Typst source for one document.
 *
 * Asset names are prefixed per part so a logo in the header cannot collide with
 * an image in the body.
 */
export function buildTypstDocument(
  parts: DocumentParts,
  page: PageOptions = {}
): TypstDocument {
  const size = page.size ?? DEFAULT_PAGE_SIZE;
  const { widthPt, heightPt } = PAGE_DIMENSIONS_PT[size];
  const canvasWidthPx = page.canvasWidthPx ?? DEFAULT_CANVAS_WIDTH_PX;
  const rootFontSizePx = page.rootFontSizePx ?? DEFAULT_ROOT_FONT_SIZE_PX;
  const scale = widthPt / canvasWidthPx;

  const assets: TypstAsset[] = [];

  const convert = (html: string, prefix: string) => {
    const fragment = htmlToTypst(html, {
      targetPageWidthPt: widthPt,
      canvasWidthPx,
      rootFontSizePx,
      assetRoot: `${ASSET_ROOT}/${prefix}`,
    });

    // The name is the path relative to the workspace root, matching the
    // absolute path the markup references.
    assets.push(
      ...fragment.assets.map((asset) => ({
        ...asset,
        name: `${ASSET_DIR}/${prefix}/${asset.name}`,
      }))
    );

    return fragment.markup;
  };

  const pageSettings = [
    `width: ${widthPt}pt`,
    `height: ${heightPt}pt`,
    `margin: ${page.margin ?? DEFAULT_MARGIN}`,
  ];

  if (page.numbering) {
    pageSettings.push(`numbering: "${page.numbering.replace(/"/g, '')}"`);
  }

  if (parts.header) {
    pageSettings.push(
      `header: ${contentBlock(convert(parts.header, 'header'))}`
    );
  }

  if (parts.footer) {
    pageSettings.push(
      `footer: ${contentBlock(convert(parts.footer, 'footer'))}`
    );
  }

  const preamble = [
    `#set page(${pageSettings.join(', ')})`,
    `#set par(justify: ${page.justify ? 'true' : 'false'})`,
    `#set text(size: ${(rootFontSizePx * scale).toFixed(2)}pt${
      page.fontFamily?.length ? `, font: ${fontList(page.fontFamily)}` : ''
    })`,
  ];

  const body = [convert(parts.body, 'body')];

  (parts.sections ?? []).forEach((section, index) => {
    body.push('#pagebreak(weak: true)');
    body.push(convert(section, `section${index}`));
  });

  return {
    source: `${preamble.join('\n')}\n\n${body.join('\n\n')}\n`,
    assets,
  };
}
