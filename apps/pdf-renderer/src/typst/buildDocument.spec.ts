import { buildTypstDocument } from './buildDocument';

describe('buildTypstDocument', () => {
  it('defaults to A4 with the margins the previous engine used', () => {
    const { source } = buildTypstDocument([{ body: '<p>x</p>' }]);

    expect(source).toContain('width: 595.28pt');
    expect(source).toContain('height: 841.89pt');
    expect(source).toContain('margin: (top: 82pt, bottom: 72pt, x: 72pt)');
  });

  it('honours the requested page size', () => {
    const { source } = buildTypstDocument([{ body: '<p>x</p>' }], {
      size: 'letter',
    });

    expect(source).toContain('width: 612pt');
    expect(source).toContain('height: 792pt');
  });

  it('scales the base text size by the page width over the canvas width', () => {
    const { source } = buildTypstDocument([{ body: '<p>x</p>' }], {
      canvasWidthPx: 800,
      rootFontSizePx: 16,
    });

    // 16 px * (595.28 / 800).
    expect(source).toContain('#set text(size: 11.91pt)');
  });

  it('omits page numbering unless asked for', () => {
    expect(buildTypstDocument([{ body: '<p>x</p>' }]).source).not.toContain(
      'numbering:'
    );
    expect(
      buildTypstDocument([{ body: '<p>x</p>' }], { numbering: '1 / 1' }).source
    ).toContain('numbering: "1 / 1"');
  });

  it('turns off justification by default', () => {
    expect(buildTypstDocument([{ body: '<p>x</p>' }]).source).toContain(
      '#set par(justify: false)'
    );
  });

  it('sets a font stack when one is given', () => {
    const { source } = buildTypstDocument([{ body: '<p>x</p>' }], {
      fontFamily: ['Calibri', 'Liberation Sans'],
    });

    expect(source).toContain('font: ("Calibri", "Liberation Sans")');
  });

  it('places the header and footer in the page settings', () => {
    const { source } = buildTypstDocument([
      {
        body: '<p>body</p>',
        header: '<p>head</p>',
        footer: '<p>foot</p>',
      },
    ]);

    expect(source).toContain('header: [');
    expect(source).toContain('head');
    expect(source).toContain('footer: [');
    expect(source).toContain('foot');
  });

  it('starts every section on a new page', () => {
    const { source } = buildTypstDocument([
      {
        body: '<p>body</p>',
        sections: ['<p>one</p>', '<p>two</p>'],
      },
    ]);

    expect(source.match(/#pagebreak\(weak: true\)/g)).toHaveLength(2);
    expect(source.indexOf('one')).toBeLessThan(source.indexOf('two'));
  });

  it('separates documents with a page break', () => {
    const { source } = buildTypstDocument([
      { body: '<p>first</p>' },
      { body: '<p>second</p>' },
    ]);

    expect(source.match(/#pagebreak\(weak: true\)/g)).toHaveLength(1);
    expect(source.indexOf('first')).toBeLessThan(source.indexOf('second'));
  });

  it('scopes each document header to its own block', () => {
    const { source } = buildTypstDocument([
      { body: '<p>first</p>', header: '<p>head one</p>' },
      { body: '<p>second</p>', header: '<p>head two</p>' },
    ]);

    // The shared page geometry stays global, the headers do not.
    expect(source.indexOf('head one')).toBeGreaterThan(
      source.indexOf('#set text(')
    );
    expect(source.match(/header: \[/g)).toHaveLength(2);
  });

  it('rejects an empty document list', () => {
    expect(() => buildTypstDocument([])).toThrow(
      /At least one document is required/
    );
  });

  it('namespaces assets per document and part so names cannot collide', () => {
    const png = `data:image/png;base64,${Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      Buffer.alloc(12),
      Buffer.from([0, 0, 0, 4, 0, 0, 0, 2]),
    ]).toString('base64')}`;

    const { assets } = buildTypstDocument([
      {
        body: `<img src="${png}">`,
        header: `<img src="${png}">`,
      },
    ]);

    expect(assets.map((asset) => asset.name).sort()).toEqual([
      'assets/d0/body/image0.png',
      'assets/d0/header/image0.png',
    ]);
  });
});
