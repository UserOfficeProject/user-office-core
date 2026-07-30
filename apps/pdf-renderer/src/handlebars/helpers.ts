import { readFileSync } from 'fs';
import { EOL } from 'os';
import { extname } from 'path';

import type Handlebars from 'handlebars';

/**
 * Handlebars helpers available to PDF templates.
 *
 * The set is kept identical to the one the factory service registered, so
 * templates authored against the old engine keep rendering. Unlike the factory
 * these are registered on a caller-supplied environment rather than the global
 * Handlebars singleton.
 */

/** Minimal shape of an attachment entry in the template payload. */
interface Attachment {
  id: string;
  figure?: string | null;
  caption?: string | null;
}

/** Minimal shape of the resolved file metadata in the template payload. */
interface FileMetadata {
  fileId: string;
  originalFileName: string;
}

const MIME_TYPE_BY_EXTENSION = new Map<string, string>([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.svg', 'image/svg+xml'],
]);

const base64Cache = new Map<string, string>();

const eolRegex = new RegExp(EOL, 'g');

export function registerHelpers(env: typeof Handlebars): void {
  env.registerHelper('$eq', (a: unknown, b: unknown) => a == b);

  env.registerHelper('$notEq', (a: unknown, b: unknown) => a != b);

  env.registerHelper('$in', function <T>(...args: T[]) {
    args.pop(); // the trailing Handlebars options object
    const [needle, ...haystack] = args;

    return haystack.includes(needle);
  });

  env.registerHelper('$sum', (...args: unknown[]) => {
    args.pop();

    return (args as number[]).reduce((sum, curr) => sum + curr, 0);
  });

  env.registerHelper('$join', (src: unknown, delimiter: string) => {
    if (!Array.isArray(src)) {
      return src;
    }

    return src.join(delimiter);
  });

  env.registerHelper('$or', (...args: unknown[]) => {
    args.pop();

    return args.some((value) => !!value);
  });

  env.registerHelper('$readableDate', (date?: string | Date) => {
    if (date === undefined || date === null) {
      return '';
    }

    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  });

  env.registerHelper('$utcDate', (date: string | Date) => {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().split('T')[0];
  });

  env.registerHelper('$readAsBase64', (path: string) => {
    // A template may reference an asset the payload does not carry, for
    // instance a logo path on a preview. Rendering the rest is better than
    // failing the whole document.
    if (typeof path !== 'string' || path === '') {
      return '';
    }

    let dataUrl = base64Cache.get(path);

    if (dataUrl === undefined) {
      const mimeType = MIME_TYPE_BY_EXTENSION.get(extname(path)) ?? 'unknown';
      dataUrl = `data:${mimeType};base64,${readFileSync(path).toString(
        'base64'
      )}`;
      base64Cache.set(path, dataUrl);
    }

    return dataUrl;
  });

  env.registerHelper(
    '$attachment',
    (attachments: Attachment[], attachmentsFileMeta: FileMetadata[]) => {
      if (!Array.isArray(attachments)) {
        return '';
      }

      const meta = Array.isArray(attachmentsFileMeta)
        ? attachmentsFileMeta
        : [];

      return attachments
        .map(({ id, figure }) => {
          const found = meta.find(({ fileId }) => fileId === id);

          if (!found) {
            return '<em>* The attachment is not supported, please download the original file from the User Office website</em>';
          }

          return figure
            ? `<em>* See appendix Figure ${figure}</em>`
            : `<em>* See appendix ${found.originalFileName}</em>`;
        })
        .join('<br/>');
    }
  );

  env.registerHelper(
    '$debug',
    (value: unknown) =>
      new env.SafeString(
        JSON.stringify(value, null, 2).replace(eolRegex, '<br>')
      )
  );
}

/** Clears the `$readAsBase64` cache. Exposed for tests. */
export function clearAssetCache(): void {
  base64Cache.clear();
}
