import { htmlToTypst } from './htmlToTypst';

const options = {
  targetPageWidthPt: 595.28,
  canvasWidthPx: 800,
  rootFontSizePx: 16,
  assetRoot: '/assets/body',
};

const convert = (html: string) => htmlToTypst(html, options);

/** A 4x2 red PNG, small enough to inline. */
const PNG_4X2 = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  Buffer.alloc(12),
  Buffer.from([0, 0, 0, 4, 0, 0, 0, 2]),
]);
const PNG_DATA_URL = `data:image/png;base64,${PNG_4X2.toString('base64')}`;

describe('htmlToTypst', () => {
  it('maps block and inline elements to Typst markup', () => {
    const { markup } = convert('<h2>Title</h2><p>a <strong>b</strong></p>');

    expect(markup).toContain('#heading(level: 2)[Title]');
    expect(markup).toContain('*b*');
  });

  it('maps a table to a Typst table', () => {
    const { markup } = convert('<table><tr><td>Q</td><td>A</td></tr></table>');

    expect(markup).toContain('#table(');
    expect(markup).toContain('columns: 2');
  });

  it('emits no page or paragraph preamble, which buildTypstDocument owns', () => {
    const { markup } = convert('<p>x</p>');

    expect(markup).not.toContain('#set page');
    expect(markup).not.toContain('#set par');
  });

  describe('CSS normalisation', () => {
    it('keeps all channels of a colour function used in a shorthand', () => {
      const { markup } = convert(
        '<style>.a{border-bottom: 2px solid rgb(0, 163, 218);}</style>' +
          '<p class="a">x</p>'
      );

      expect(markup).toContain('rgb(0,163,218)');
      expect(markup).not.toContain('rgb(0,,');
    });

    it('tolerates a declaration split across lines', () => {
      const { markup } = convert(
        '<style>.a{ color: rgb(0, 163,\n 218); }</style><p class="a">x</p>'
      );

      expect(markup).toContain('rgb(0,163,218)');
    });

    it('normalises inline styles without changing the quoting', () => {
      const style = 'color: rgb(255, 0, 0)';
      const { markup } = convert(`<p style='${style}'>x</p>`);

      expect(markup).toContain('rgb(255,0,0)');
    });
  });

  describe('page counters', () => {
    it('translates the page number span into a Typst counter', () => {
      const { markup } = convert('Page <span class="pageNumber"></span>');

      expect(markup).toContain('#context counter(page).display()');
    });

    it('translates the total pages span into a final counter', () => {
      const { markup } = convert('of <span class="totalPages"></span>');

      expect(markup).toContain('#context counter(page).final().first()');
    });
  });

  describe('images', () => {
    it('turns a data URL into an asset and an #image call', () => {
      const { markup, assets } = convert(`<img src="${PNG_DATA_URL}">`);

      expect(assets).toHaveLength(1);
      expect(assets[0].name).toBe('image0.png');
      expect(markup).toContain('image("/assets/body/image0.png"');
      expect(markup).toContain('format: "png"');
    });

    it('sizes the image from its intrinsic width scaled to points', () => {
      const { markup } = convert(`<img src="${PNG_DATA_URL}">`);

      // 4 px at a scale of 595.28 / 800.
      expect(markup).toContain('width: 2.98pt');
    });

    it('prefers an explicit width attribute over the intrinsic width', () => {
      const { markup } = convert(`<img src="${PNG_DATA_URL}" width="80">`);

      expect(markup).toContain('width: 59.53pt');
    });

    it('caps the width by an inline max-height, keeping the aspect ratio', () => {
      const { markup } = convert(
        `<img src="${PNG_DATA_URL}" style="max-height: 1px">`
      );

      // 1 px tall at a 2:1 aspect ratio is 2 px wide.
      expect(markup).toContain('width: 1.49pt');
    });

    it('drops an image whose mime type cannot be embedded', () => {
      const { markup, assets } = convert(
        '<img src="data:image/tiff;base64,AAAA">'
      );

      expect(assets).toHaveLength(0);
      expect(markup).not.toContain('#image');
    });

    it('leaves a remote image to the converter, which drops it', () => {
      const { assets } = convert('<img src="https://example.com/a.png">');

      expect(assets).toHaveLength(0);
    });
  });

  it('does not leak the document title into the body', () => {
    const { markup } = convert(
      '<html><head><title>Leaked</title></head><body><p>kept</p></body></html>'
    );

    expect(markup).not.toContain('Leaked');
    expect(markup).toContain('kept');
  });

  it('drops scripts', () => {
    const { markup } = convert('<script>alert(1)</script><p>x</p>');

    expect(markup).not.toContain('alert');
  });
});
