import { buildTypstDocument } from './buildDocument';

describe('buildTypstDocument', () => {
  it('defaults to A4 with the margins the previous engine used', () => {
    const { source } = buildTypstDocument({ body: '<p>x</p>' });

    expect(source).toContain('width: 595.28pt');
    expect(source).toContain('height: 841.89pt');
    expect(source).toContain('margin: (top: 82pt, bottom: 72pt, x: 72pt)');
  });

  it('honours the requested page size', () => {
    const { source } = buildTypstDocument(
      { body: '<p>x</p>' },
      { size: 'letter' }
    );

    expect(source).toContain('width: 612pt');
    expect(source).toContain('height: 792pt');
  });

  it('scales the base text size by the page width over the canvas width', () => {
    const { source } = buildTypstDocument(
      { body: '<p>x</p>' },
      { canvasWidthPx: 800, rootFontSizePx: 16 }
    );

    // 16 px * (595.28 / 800).
    expect(source).toContain('#set text(size: 11.91pt)');
  });

  it('omits page numbering unless asked for', () => {
    expect(buildTypstDocument({ body: '<p>x</p>' }).source).not.toContain(
      'numbering:'
    );
    expect(
      buildTypstDocument({ body: '<p>x</p>' }, { numbering: '1 / 1' }).source
    ).toContain('numbering: "1 / 1"');
  });

  it('turns off justification by default', () => {
    expect(buildTypstDocument({ body: '<p>x</p>' }).source).toContain(
      '#set par(justify: false)'
    );
  });

  it('sets a font stack when one is given', () => {
    const { source } = buildTypstDocument(
      { body: '<p>x</p>' },
      { fontFamily: ['Calibri', 'Liberation Sans'] }
    );

    expect(source).toContain('font: ("Calibri", "Liberation Sans")');
  });

  it('places the header and footer in the page settings', () => {
    const { source } = buildTypstDocument({
      body: '<p>body</p>',
      header: '<p>head</p>',
      footer: '<p>foot</p>',
    });

    const pageSettings = source.slice(0, source.indexOf('#set par'));

    expect(pageSettings).toContain('header: [');
    expect(pageSettings).toContain('head');
    expect(pageSettings).toContain('footer: [');
    expect(pageSettings).toContain('foot');
  });

  it('starts every section on a new page', () => {
    const { source } = buildTypstDocument({
      body: '<p>body</p>',
      sections: ['<p>one</p>', '<p>two</p>'],
    });

    expect(source.match(/#pagebreak\(weak: true\)/g)).toHaveLength(2);
    expect(source.indexOf('one')).toBeLessThan(source.indexOf('two'));
  });

  it('namespaces assets per part so names cannot collide', () => {
    const png = `data:image/png;base64,${Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      Buffer.alloc(12),
      Buffer.from([0, 0, 0, 4, 0, 0, 0, 2]),
    ]).toString('base64')}`;

    const { assets } = buildTypstDocument({
      body: `<img src="${png}">`,
      header: `<img src="${png}">`,
    });

    expect(assets.map((asset) => asset.name).sort()).toEqual([
      'assets/body/image0.png',
      'assets/header/image0.png',
    ]);
  });
});
