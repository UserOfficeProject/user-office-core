/**
 * Public types of the renderer.
 *
 * The renderer has no knowledge of proposals, experiments or HTTP. It takes
 * Handlebars templates plus a plain data object and returns PDF bytes.
 */

/** Named page sizes accepted by the Typst page setup. */
export type PageSize =
  | 'a0'
  | 'a1'
  | 'a2'
  | 'a3'
  | 'a4'
  | 'a5'
  | 'a6'
  | 'b4'
  | 'b5'
  | 'letter'
  | 'legal'
  | 'tabloid';

/** The set of Handlebars templates that make up one document. */
export interface DocumentTemplates {
  /** Main body. Required. */
  body: string;
  /** Optional running header, repeated on every page. */
  header?: string;
  /** Optional running footer, repeated on every page. */
  footer?: string;
  /**
   * Optional per-section template appended after the body, once per entry in
   * `sections`. Used for proposal sample declarations.
   */
  section?: string;
}

/** Page geometry and typography settings. */
export interface PageOptions {
  size?: PageSize;
  /** Margin string passed verbatim to Typst, e.g. `2cm` or `(top: 3cm, rest: 2cm)`. */
  margin?: string;
  /** Page number format, e.g. `1 / 1`. Omit to hide page numbers. */
  numbering?: string;
  /**
   * Width in pixels the HTML was authored against. Pixel sizes in the template
   * are scaled to points using `pageWidthPt / canvasWidthPx`.
   */
  canvasWidthPx?: number;
  /** Pixel value of `1rem`. Defaults to the browser default of 16. */
  rootFontSizePx?: number;
  /** Justify body text. Defaults to false to stay close to browser rendering. */
  justify?: boolean;
  /**
   * Font stack for body text, most preferred first. Names must resolve against
   * the system fonts or `fontPaths`, otherwise Typst falls back to its default.
   */
  fontFamily?: string[];
}

/** One render request: templates in, PDF out. */
export interface RenderRequest {
  templates: DocumentTemplates;
  /** Root context handed to every template. */
  data: Record<string, unknown>;
  /**
   * Extra contexts rendered through `templates.section`, each on a new page
   * after the body.
   */
  sections?: Record<string, unknown>[];
  page?: PageOptions;
  /** Directories searched for fonts, in addition to system fonts. */
  fontPaths?: string[];
}

/** Result of a render, with the intermediate stages kept for debugging. */
export interface RenderResult {
  pdf: Buffer;
  /** HTML produced by Handlebars. */
  html: string;
  /** Typst source handed to the compiler. */
  typst: string;
}
