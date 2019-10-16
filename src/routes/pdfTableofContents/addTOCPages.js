const {
  verticalMax,
  horizontalMax,
  verticalMargin,
  leftMarginEnd,
  lineSpacing,
  fontPath
} = require("../config");

const writeLine = (
  pageCtx,
  text,
  font,
  fontFactor,
  horizontalBegin,
  verticalBegin
) => {
  pageCtx
    .BT()
    .k(0, 0, 0, 1)
    .Tf(font, fontFactor)
    .Tm(30, 0, 0, 30, horizontalBegin, verticalBegin)
    .Tj(text)
    .ET();
};

module.exports = (writer, text, customFont = null) => {
  const font = writer.getFontForFile(customFont || fontPath, 0);

  let page = writer.createPage(0, 0, horizontalMax, verticalMax);
  let pageCtx = writer.startPageContentContext(page);

  const verticalTextStart = verticalMax - verticalMargin;
  writeLine(pageCtx, "Contents!", font, 1, leftMarginEnd, verticalTextStart);
  writeLine(pageCtx, "Page", font, 0.8, 470, verticalTextStart);

  let pageSize = 0;
  // Courier = .4
  // Monofur = .47
  // Monkey = .63, with heading of 1 and .8
  text.forEach(({ line }, idx) => {
    const pageIndex = pageSize ? idx % pageSize : idx;
    const verticalOffset = lineSpacing * (pageIndex + 1);
    const verticalLineStart = verticalTextStart - verticalOffset;
    if (verticalLineStart <= verticalMargin) {
      if (!pageSize) {
        pageSize = idx + 1;
      }
      writer.writePage(page);
      page = writer.createPage(0, 0, horizontalMax, verticalMax);
      pageCtx = writer.startPageContentContext(page);
      writeLine(pageCtx, line, font, 0.63, leftMarginEnd, verticalTextStart);
    } else {
      writeLine(pageCtx, line, font, 0.63, leftMarginEnd, verticalLineStart);
    }
  });

  writer.writePage(page);
  return pageSize || text.length;
};
