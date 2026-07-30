import { parse } from 'dom-typst';

import { readImageSize } from './imageSize';

/**
 * Stage 2 of the pipeline: HTML string -> Typst markup.
 *
 * `dom-typst` does the element and CSS mapping. Two things it cannot do are
 * handled here, before and after that call:
 *
 * - `data:` URL images are dropped by the converter, so they are pulled out and
 *   re-attached as Typst assets referenced by `#image(...)`.
 * - the page-number spans that Chromium used to fill in have no HTML meaning,
 *   so they are translated into Typst page counters.
 *
 * Both work through plain-text tokens that survive the conversion untouched.
 * Tokens are alphanumeric on purpose: Typst escapes punctuation in text.
 */

/** A binary file the Typst compiler must be able to read during compilation. */
export interface TypstAsset {
  /** File name inside the asset directory. */
  name: string;
  content: Buffer;
}

/** Converted markup plus anything it references. */
export interface TypstFragment {
  markup: string;
  assets: TypstAsset[];
}

export interface ConvertOptions {
  /** Target page width in points, used for the px -> pt scale factor. */
  targetPageWidthPt: number;
  /** Pixel width the HTML was authored against. */
  canvasWidthPx: number;
  /** Pixel value of `1rem`. */
  rootFontSizePx: number;
  /** Typst-visible directory the assets will be placed in, e.g. `/assets/r0`. */
  assetRoot: string;
}

const TOKEN_PREFIX = 'UOTOKEN';
const TOKEN_SUFFIX = 'UOEND';

const token = (name: string) => `${TOKEN_PREFIX}${name}${TOKEN_SUFFIX}`;

const MIME_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/webp': 'webp',
};

/**
 * Text that has no printed representation. `<title>` matters because the
 * converter otherwise emits its text as part of the body.
 */
const NON_RENDERABLE = /<(title|script|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi;

const PAGE_NUMBER_SPAN =
  /<span[^>]*class\s*=\s*["']?[^"'>]*\bpageNumber\b[^"'>]*["']?[^>]*>\s*<\/span>/gi;

const TOTAL_PAGES_SPAN =
  /<span[^>]*class\s*=\s*["']?[^"'>]*\btotalPages\b[^"'>]*["']?[^>]*>\s*<\/span>/gi;

const IMG_TAG = /<img\b[^>]*>/gi;

const DATA_URL = /^data:([^;,]+);base64,([\s\S]+)$/i;

const STYLE_BLOCK = /<style\b[^>]*>[\s\S]*?<\/style>/gi;

const STYLE_ATTRIBUTE = /\bstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

const COLOR_FUNCTION = /\b(rgba?|hsla?)\(([^)]*)\)/gi;

/**
 * Rewrites CSS so the converter can read it.
 *
 * Two shapes are known to break `dom-typst`'s CSS parsing, both of which the
 * default templates use:
 *
 * - a declaration split across lines, e.g. `color: rgb(0, 163,\n 218)`
 * - spaces inside a colour function used in a shorthand, e.g.
 *   `border-bottom: 2px solid rgb(0, 163, 218)`, which loses the last two
 *   channels
 *
 * Collapsing whitespace and tightening colour functions keeps the CSS
 * semantically identical while staying inside what the converter handles.
 */
function normalizeCss(css: string): string {
  return css
    .replace(/\s+/g, ' ')
    .replace(
      COLOR_FUNCTION,
      (_match, fn, args) => `${fn}(${args.replace(/\s+/g, '')})`
    );
}

function normalizeStyles(html: string): string {
  return html
    .replace(STYLE_BLOCK, (block) => normalizeCss(block))
    .replace(STYLE_ATTRIBUTE, (match, doubleQuoted, singleQuoted) => {
      const value = doubleQuoted ?? singleQuoted ?? '';

      // Substituting into the match keeps whichever quote style was used.
      return value ? match.replace(value, normalizeCss(value)) : match;
    });
}

function attribute(tag: string, name: string): string | undefined {
  const match = tag.match(
    new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  );

  if (!match) {
    return undefined;
  }

  return match[1] ?? match[2] ?? match[3];
}

function styleLengthPx(
  style: string | undefined,
  property: string
): number | undefined {
  if (!style) {
    return undefined;
  }

  const match = style.match(
    new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([\\d.]+)\\s*px`, 'i')
  );

  return match ? Number(match[1]) : undefined;
}

function numeric(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  const parsed = Number(value.replace(/px$/i, ''));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Works out how wide the image should be, in CSS pixels, from the attributes,
 * the inline style and finally the image's own header.
 */
function resolveWidthPx(tag: string, content: Buffer): number | undefined {
  const style = attribute(tag, 'style');
  const intrinsic = readImageSize(content);

  const explicitWidth =
    numeric(attribute(tag, 'width')) ?? styleLengthPx(style, 'width');
  const explicitHeight =
    numeric(attribute(tag, 'height')) ?? styleLengthPx(style, 'height');

  const aspect =
    intrinsic && intrinsic.heightPx > 0
      ? intrinsic.widthPx / intrinsic.heightPx
      : undefined;

  let widthPx =
    explicitWidth ??
    (explicitHeight !== undefined && aspect !== undefined
      ? explicitHeight * aspect
      : intrinsic?.widthPx);

  if (widthPx === undefined) {
    return undefined;
  }

  const maxWidth = styleLengthPx(style, 'max-width');
  if (maxWidth !== undefined) {
    widthPx = Math.min(widthPx, maxWidth);
  }

  const maxHeight = styleLengthPx(style, 'max-height');
  if (maxHeight !== undefined && aspect !== undefined) {
    widthPx = Math.min(widthPx, maxHeight * aspect);
  }

  return widthPx;
}

function escapeTypstString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Converts an HTML fragment or full document into Typst markup. */
export function htmlToTypst(
  html: string,
  options: ConvertOptions
): TypstFragment {
  const substitutions = new Map<string, string>();
  const assets: TypstAsset[] = [];

  const scale = options.targetPageWidthPt / options.canvasWidthPx;

  let processed = normalizeStyles(html.replace(NON_RENDERABLE, ''));

  processed = processed.replace(PAGE_NUMBER_SPAN, () => {
    const name = 'pageNumber';
    substitutions.set(token(name), '#context counter(page).display()');

    return token(name);
  });

  processed = processed.replace(TOTAL_PAGES_SPAN, () => {
    const name = 'totalPages';
    substitutions.set(token(name), '#context counter(page).final().first()');

    return token(name);
  });

  processed = processed.replace(IMG_TAG, (tag) => {
    const src = attribute(tag, 'src');
    const dataUrl = src?.match(DATA_URL);

    if (!dataUrl) {
      // Remote images are left for dom-typst, which drops them. The old engine
      // could only load them because it ran inside a browser.
      return tag;
    }

    const extension = MIME_EXTENSIONS[dataUrl[1].toLowerCase()];

    if (!extension) {
      return '';
    }

    const content = Buffer.from(dataUrl[2].replace(/\s/g, ''), 'base64');
    const name = `image${assets.length}.${extension}`;
    assets.push({ name, content });

    const widthPx = resolveWidthPx(tag, content);
    const path = escapeTypstString(`${options.assetRoot}/${name}`);
    const sizing =
      widthPx === undefined ? '' : `, width: ${(widthPx * scale).toFixed(2)}pt`;

    const tokenName = `image${assets.length - 1}`;
    substitutions.set(
      token(tokenName),
      `#box(image("${path}"${sizing}, format: "${
        extension === 'jpg' ? 'jpg' : extension
      }"))`
    );

    return token(tokenName);
  });

  const { typstBody } = parse(processed, {
    targetPageWidthPt: options.targetPageWidthPt,
    editorCanvasWidthPx: options.canvasWidthPx,
    rootFontSizePx: options.rootFontSizePx,
    // The preamble is assembled by buildTypstDocument, not here.
    justify: false,
  });

  let markup = typstBody;
  for (const [needle, replacement] of substitutions) {
    markup = markup.split(needle).join(replacement);
  }

  return { markup, assets };
}
