import { verticalMax, verticalMargin, lineSpacing } from './config';

export default itemCount => {
  const verticalTextStart = verticalMax - verticalMargin;

  let pageSize = 0;
  let pages = 1;

  for (let i = 0; i < itemCount; i++) {
    const pageIndex = pageSize ? i % pageSize : i;
    const verticalOffset = lineSpacing * (pageIndex + 1);
    const verticalLineStart = verticalTextStart - verticalOffset;
    if (verticalLineStart <= verticalMargin) {
      pages++;
      if (!pageSize) {
        pageSize = i + 1;
      }
    }
  }

  return pages;
};
