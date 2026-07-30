import { readFileSync } from 'fs';
import { join } from 'path';

import { compileTypst } from './compile';

const ESS_LOGO = join(
  __dirname,
  '..',
  '..',
  '..',
  'backend',
  'images',
  'ESS.png'
);

const isPdf = (bytes: Buffer) => bytes.subarray(0, 5).toString() === '%PDF-';

describe('compileTypst', () => {
  it('compiles Typst source to PDF bytes', () => {
    const pdf = compileTypst('= Heading\n\nSome text.\n');

    expect(isPdf(pdf)).toBe(true);
    expect(pdf.length).toBeGreaterThan(1000);
  });

  it('resolves an asset handed to it as an in-memory shadow file', () => {
    const pdf = compileTypst('#image("/assets/logo.png", width: 80pt)\n', {
      assets: [{ name: 'assets/logo.png', content: readFileSync(ESS_LOGO) }],
    });

    expect(isPdf(pdf)).toBe(true);
  });

  it('reports the Typst diagnostic when the source is invalid', () => {
    expect(() => compileTypst('#unclosed(')).toThrow(
      /Typst compilation failed/
    );
  });

  it('reports a missing asset rather than producing a broken PDF', () => {
    expect(() => compileTypst('#image("/assets/absent.png")')).toThrow(
      /file not found/
    );
  });

  it('unmaps assets after a compilation, so they do not leak between renders', () => {
    compileTypst('#image("/assets/scoped.png", width: 10pt)', {
      assets: [{ name: 'assets/scoped.png', content: readFileSync(ESS_LOGO) }],
    });

    expect(() => compileTypst('#image("/assets/scoped.png")')).toThrow(
      /file not found/
    );
  });
});
