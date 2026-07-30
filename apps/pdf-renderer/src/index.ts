/**
 * Browser-free PDF renderer.
 *
 *   Handlebars template + data
 *     -> HTML          (handlebars)
 *     -> Typst markup  (dom-typst)
 *     -> PDF           (@myriaddreamin/typst-ts-node-compiler)
 *
 * `renderPdf` is the only thing most callers need. The individual stages are
 * exported so they can be tested and debugged on their own.
 */
export { renderPdf } from './renderPdf';

export {
  createTemplateEngine,
  renderHtml,
  type TemplateEngine,
} from './handlebars/renderHtml';
export { registerHelpers, clearAssetCache } from './handlebars/helpers';

export {
  htmlToTypst,
  type ConvertOptions,
  type TypstAsset,
  type TypstFragment,
} from './typst/htmlToTypst';
export {
  buildTypstDocument,
  ASSET_DIR,
  ASSET_ROOT,
  type DocumentParts,
  type TypstDocument,
} from './typst/buildDocument';
export {
  compileTypst,
  resetCompilers,
  type CompileOptions,
} from './typst/compile';
export { readImageSize, type ImageSize } from './typst/imageSize';
export {
  PAGE_DIMENSIONS_PT,
  DEFAULT_PAGE_SIZE,
  DEFAULT_CANVAS_WIDTH_PX,
  DEFAULT_ROOT_FONT_SIZE_PX,
  DEFAULT_MARGIN,
} from './typst/pageSizes';

export type {
  DocumentTemplates,
  PageOptions,
  PageSize,
  RenderRequest,
  RenderResult,
} from './types';
