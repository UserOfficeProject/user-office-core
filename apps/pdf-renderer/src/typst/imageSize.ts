/**
 * Reads intrinsic pixel dimensions straight out of image bytes.
 *
 * Needed because Typst sizes an image to the available width when no explicit
 * width is given, which would blow a small header logo up to the full page.
 * Only the formats that can appear in a `data:` URL in a PDF template are
 * covered.
 */

export interface ImageSize {
  widthPx: number;
  heightPx: number;
}

function readPng(bytes: Buffer): ImageSize | null {
  // 8 byte signature, then a 25 byte IHDR chunk holding width and height.
  if (bytes.length < 24 || bytes.readUInt32BE(0) !== 0x89504e47) {
    return null;
  }

  return { widthPx: bytes.readUInt32BE(16), heightPx: bytes.readUInt32BE(20) };
}

function readGif(bytes: Buffer): ImageSize | null {
  if (bytes.length < 10 || bytes.toString('latin1', 0, 3) !== 'GIF') {
    return null;
  }

  return { widthPx: bytes.readUInt16LE(6), heightPx: bytes.readUInt16LE(8) };
}

function readJpeg(bytes: Buffer): ImageSize | null {
  if (bytes.length < 4 || bytes.readUInt16BE(0) !== 0xffd8) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    // SOF0..SOF3, SOF5..SOF7, SOF9..SOF11, SOF13..SOF15 carry the frame size.
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isStartOfFrame) {
      return {
        heightPx: bytes.readUInt16BE(offset + 5),
        widthPx: bytes.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + bytes.readUInt16BE(offset + 2);
  }

  return null;
}

/** Returns the intrinsic size, or null when the format is not recognised. */
export function readImageSize(bytes: Buffer): ImageSize | null {
  return readPng(bytes) ?? readJpeg(bytes) ?? readGif(bytes);
}
