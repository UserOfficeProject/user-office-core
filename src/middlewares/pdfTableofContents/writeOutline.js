const writeOutlines = (ctx, outlines, parent, linkToTop = true) => {
  const ids = outlines.map(() => ctx.allocateNewObjectID());

  outlines.forEach(({ title, page, children }, i) => {
    const id = ids[i];
    const childrenIds =
      children && children.length ? writeOutlines(ctx, children, id) : null;

    ctx.startNewIndirectObject(id);
    const d = ctx
      .startDictionary()
      .writeKey('Title')
      .writeLiteralStringValue(title)
      .writeKey('Parent')
      .writeObjectReferenceValue(parent);

    if (page) {
      d.writeKey('Dest');
      ctx.startArray();
      ctx.writeIndirectObjectReference(page);
      ctx.writeName('XYZ');
      const c = ctx.startFreeContext();
      if (linkToTop) {
        c.write([32, 48, 32, 55, 57, 50, 32, 48, 32]); // " 0 792 0 " - go to top
      } else {
        c.write([32, 110, 117, 108, 108, 32, 110, 117, 108, 108, 32, 48, 32]); // " null null 0 " - stay at same position
      }
      ctx.endFreeContext();
      ctx.endArray();
    }

    ctx.endLine();
    if (childrenIds) {
      d.writeKey('Count')
        .writeNumberValue(outlines.length)
        .writeKey('First')
        .writeObjectReferenceValue(childrenIds[0])
        .writeKey('Last')
        .writeObjectReferenceValue(childrenIds[childrenIds.length - 1]);
    }

    if (i + 1 < ids.length) {
      d.writeKey('Next').writeObjectReferenceValue(ids[i + 1]);
    }

    if (i > 0) {
      d.writeKey('Prev').writeObjectReferenceValue(ids[i - 1]);
    }

    ctx.endDictionary(d);
    ctx.endIndirectObject();
  });

  return ids;
};

module.exports = (ctx, outlines) => {
  if (outlines.length === 0) {
    return null;
  }

  const outline = ctx.allocateNewObjectID();
  const outlineIds = writeOutlines(ctx, outlines, outline);
  ctx.startNewIndirectObject(outline);
  const d = ctx
    .startDictionary()
    .writeKey('Type')
    .writeNameValue('Outlines')
    .writeKey('Count')
    .writeNumberValue(outlineIds.length)
    .writeKey('First')
    .writeObjectReferenceValue(outlineIds[0])
    .writeKey('Last')
    .writeObjectReferenceValue(outlineIds[outlineIds.length - 1]);
  ctx.endDictionary(d);
  ctx.endIndirectObject();

  return outline;
};
