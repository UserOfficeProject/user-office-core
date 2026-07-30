import { readFileSync } from 'fs';
import { join } from 'path';

import { readImageSize } from './imageSize';

/** The logo shipped with the backend, used as a real-world PNG. */
const ESS_LOGO = join(
  __dirname,
  '..',
  '..',
  '..',
  'backend',
  'images',
  'ESS.png'
);

describe('readImageSize', () => {
  it('reads the size out of a PNG header', () => {
    const png = Buffer.alloc(24);
    png.writeUInt32BE(0x89504e47, 0);
    png.writeUInt32BE(320, 16);
    png.writeUInt32BE(240, 20);

    expect(readImageSize(png)).toEqual({ widthPx: 320, heightPx: 240 });
  });

  it('reads the size out of a real PNG', () => {
    const size = readImageSize(readFileSync(ESS_LOGO));

    expect(size?.widthPx).toBeGreaterThan(0);
    expect(size?.heightPx).toBeGreaterThan(0);
  });

  it('reads the size out of a GIF header', () => {
    const gif = Buffer.alloc(10);
    gif.write('GIF89a', 0, 'latin1');
    gif.writeUInt16LE(12, 6);
    gif.writeUInt16LE(34, 8);

    expect(readImageSize(gif)).toEqual({ widthPx: 12, heightPx: 34 });
  });

  it('reads the size out of a JPEG start-of-frame marker', () => {
    // SOI, a 4 byte APP0 segment to skip, then an SOF0 carrying the size.
    const jpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11,
      0x08, 0x01, 0x2c, 0x02, 0x58, 0x00, 0x00, 0x00,
    ]);

    expect(readImageSize(jpeg)).toEqual({ widthPx: 600, heightPx: 300 });
  });

  it('returns null for an unrecognised format', () => {
    expect(readImageSize(Buffer.from('not an image'))).toBeNull();
  });
});
