const hummus = require('hummus');

//const addTOCPages = require("./src/addTOCPages");
const countOutline = require('./countOutline');
const countPages = require('./countPages');
const getTOCText = require('./getTOCText');
const translatePageNumbers = require('./translatePageNumbers');
const writeLinks = require('./writeLinks');
const writeOutline = require('./writeOutline');

export function createToC(
  inFile: string,
  outFile: string,
  origOutline: any[],
  font = null
) {
  // Start new PDF to contain TOC pages only
  const newPDFWriter = hummus.createWriter(outFile);
  const outlineSize = countOutline(origOutline);
  //const howManyPages = countPages(outlineSize);
  const howManyPages = 1;
  const tocText = getTOCText(origOutline, howManyPages);
  //const tocPageSize = addTOCPages(newPDFWriter, tocText, font)
  newPDFWriter.appendPDFPagesFromPDF(inFile);
  newPDFWriter.end();
  // End TOC PDF

  // Start final PDF containing bookmarks as well as TOC pages
  const mergingWriter = hummus.createWriterToModify(outFile);
  const ctx = mergingWriter.getObjectsContext();
  const events = mergingWriter.getEvents();
  const copyCtx = mergingWriter.createPDFCopyingContextForModifiedFile();
  const parser = copyCtx.getSourceDocumentParser();

  // translate numbers from index to PDF object IDs
  const translatedOutline = origOutline.map(childOutline =>
    translatePageNumbers(parser, childOutline, howManyPages)
  );

  // write bookmarks
  const outline = writeOutline(ctx, translatedOutline);

  // create link annotations for TOC to locations in file
  for (let i = 0; i < howManyPages; i++) {
    writeLinks(ctx, copyCtx, parser, i, tocText, howManyPages, 0);
  }

  // before writer closes, add outline to PDF
  events.on('OnCatalogWrite', (e: any) => {
    const d = e.catalogDictionaryContext;
    if (outline !== null) {
      d.writeKey('Outlines')
        .writeObjectReferenceValue(outline)
        .writeKey('PageMode')
        .writeNameValue('UseOutlines');
    }
  });

  // force update, in case it is necessary
  mergingWriter.requireCatalogUpdate();
  mergingWriter.end();
  // End Final PDF
}
