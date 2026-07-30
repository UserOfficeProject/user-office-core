import { PageSize } from '../types';

/** Page dimensions in PostScript points, matching the sizes dom-typst knows. */
export const PAGE_DIMENSIONS_PT: Record<
  PageSize,
  { widthPt: number; heightPt: number }
> = {
  a0: { widthPt: 2383.94, heightPt: 3370.39 },
  a1: { widthPt: 1683.78, heightPt: 2383.94 },
  a2: { widthPt: 1190.55, heightPt: 1683.78 },
  a3: { widthPt: 841.89, heightPt: 1190.55 },
  a4: { widthPt: 595.28, heightPt: 841.89 },
  a5: { widthPt: 419.53, heightPt: 595.28 },
  a6: { widthPt: 297.64, heightPt: 419.53 },
  b4: { widthPt: 708.66, heightPt: 1000.63 },
  b5: { widthPt: 498.9, heightPt: 708.66 },
  letter: { widthPt: 612, heightPt: 792 },
  legal: { widthPt: 612, heightPt: 1008 },
  tabloid: { widthPt: 792, heightPt: 1224 },
};

export const DEFAULT_PAGE_SIZE: PageSize = 'a4';

/** Width the templates are authored against, matching the old Chromium viewport. */
export const DEFAULT_CANVAS_WIDTH_PX = 800;

export const DEFAULT_ROOT_FONT_SIZE_PX = 16;

/** Same margins the factory passed to `page.pdf()`, in points. */
export const DEFAULT_MARGIN = '(top: 82pt, bottom: 72pt, x: 72pt)';
