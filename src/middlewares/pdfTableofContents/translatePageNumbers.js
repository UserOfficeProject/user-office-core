const translatePageNumbers = (parser, outline, offset = 0) =>
  outline.children
    ? {
        ...outline,
        page:
          outline.page || outline.page === 0
            ? parser.getPageObjectID(outline.page + offset - 1)
            : undefined,
        children: outline.children.map(childOutline =>
          translatePageNumbers(parser, childOutline, offset)
        ),
      }
    : {
        ...outline,
        page:
          outline.page || outline.page === 0
            ? parser.getPageObjectID(outline.page + offset - 1)
            : undefined,
      };

module.exports = translatePageNumbers;
