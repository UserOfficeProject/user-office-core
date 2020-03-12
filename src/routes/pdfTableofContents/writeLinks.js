const {
  verticalMax,
  verticalMargin,
  lineSpacing,
  leftMarginEnd,
} = require('./config');
const createLink = require('./createLink');
const annotationArrayKey = 'Annots';

const isFirstLineOnSubsequentPage = (pageSize, pageIndex, idx) =>
  pageIndex > 0 && (idx + 1) % pageSize === 0;

const getLinks = (
  objCtx,
  parser,
  tocText,
  pageIndex,
  howManyPages,
  pageSize
) => {
  let myPage = 0;

  return tocText.reduce((acc, { page }, idx) => {
    const verticalTextStart = verticalMax - verticalMargin;
    const verticalOffset = lineSpacing * (idx % pageSize);
    const verticalLineStart =
      verticalTextStart - (verticalOffset + lineSpacing);
    if (verticalLineStart <= verticalMargin) {
      myPage++;
    }
    // only for page of links (calculated by height) currently being worked on
    if (page && pageIndex === myPage) {
      const vertStart = isFirstLineOnSubsequentPage(pageSize, pageIndex, idx)
        ? verticalTextStart
        : verticalLineStart;
      acc.push(
        createLink(objCtx, parser.getPageObjectID(page + howManyPages - 1), [
          leftMarginEnd,
          vertStart,
          505,
          vertStart + lineSpacing,
        ])
      );
    }

    return acc;
  }, []);
};

module.exports = (
  objCtx,
  copyCtx,
  parser,
  pageIndex,
  tocText,
  howManyPages,
  pageSize
) => {
  const pageId = parser.getPageObjectID(pageIndex);
  const pageObject = parser
    .parsePage(pageIndex)
    .getDictionary()
    .toJSObject();

  const links = getLinks(
    objCtx,
    parser,
    tocText,
    pageIndex,
    howManyPages,
    pageSize
  );

  objCtx.startModifiedIndirectObject(pageId);
  const modifiedPageObject = objCtx.startDictionary();

  Object.getOwnPropertyNames(pageObject).forEach(element => {
    // leave everything besides annotations on TOC pages in tact
    // bookmark annotations are at doc level, so won't be affected
    if (element !== annotationArrayKey) {
      modifiedPageObject.writeKey(element);
      copyCtx.copyDirectObjectAsIs(pageObject[element]);
    }
  });

  modifiedPageObject.writeKey(annotationArrayKey);
  objCtx.startArray();

  links.forEach(link => objCtx.writeIndirectObjectReference(link));

  objCtx
    .endArray()
    .endLine()
    .endDictionary(modifiedPageObject)
    .endIndirectObject();
};
