import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { clearAssetCache } from './helpers';
import { createTemplateEngine, renderHtml } from './renderHtml';

const engine = createTemplateEngine();
const render = (template: string, data: Record<string, unknown> = {}) =>
  renderHtml(template, data, engine);

describe('template helpers', () => {
  describe('$eq and $notEq', () => {
    it('compares loosely, as the previous engine did', () => {
      expect(render('{{#if ($eq a b)}}same{{/if}}', { a: 1, b: '1' })).toBe(
        'same'
      );
      expect(render('{{#if ($notEq a b)}}differ{{/if}}', { a: 1, b: 2 })).toBe(
        'differ'
      );
    });
  });

  describe('$in', () => {
    it('is true when the first argument is among the rest', () => {
      expect(
        render('{{#if ($in role "a" "b")}}yes{{/if}}', { role: 'b' })
      ).toBe('yes');
      expect(
        render('{{#if ($in role "a" "b")}}yes{{/if}}', { role: 'c' })
      ).toBe('');
    });
  });

  describe('$sum', () => {
    it('adds every argument', () => {
      expect(render('{{$sum 1 2 3}}')).toBe('6');
    });
  });

  describe('$join', () => {
    it('joins arrays and passes other values through', () => {
      expect(render('{{$join items ", "}}', { items: ['a', 'b'] })).toBe(
        'a, b'
      );
      expect(render('{{$join items ", "}}', { items: 'a' })).toBe('a');
    });
  });

  describe('$or', () => {
    it('is true when any argument is truthy', () => {
      expect(render('{{#if ($or a b)}}yes{{/if}}', { a: 0, b: 'x' })).toBe(
        'yes'
      );
      expect(render('{{#if ($or a b)}}yes{{/if}}', { a: 0, b: '' })).toBe('');
    });
  });

  describe('date helpers', () => {
    it('formats a readable date as dd/mm/yyyy', () => {
      expect(render('{{$readableDate d}}', { d: '2026-03-09T10:00:00Z' })).toBe(
        '09/03/2026'
      );
    });

    it('returns an empty string for a missing readable date', () => {
      expect(render('{{$readableDate d}}', {})).toBe('');
    });

    it('formats a UTC date as an ISO day', () => {
      expect(render('{{$utcDate d}}', { d: '2026-03-09T23:30:00Z' })).toBe(
        '2026-03-09'
      );
    });

    it('returns an empty string for an unparseable UTC date', () => {
      expect(render('{{$utcDate d}}', { d: 'not a date' })).toBe('');
    });
  });

  describe('$readAsBase64', () => {
    beforeEach(() => clearAssetCache());

    it('inlines a file as a data URL with the mime type of its extension', () => {
      const dir = mkdtempSync(join(tmpdir(), 'helper-spec-'));
      const file = join(dir, 'logo.png');
      writeFileSync(file, Buffer.from([1, 2, 3]));

      expect(render('{{{$readAsBase64 path}}}', { path: file })).toBe(
        'data:image/png;base64,AQID'
      );
    });

    it('renders nothing when the path is missing from the payload', () => {
      expect(render('{{{$readAsBase64 path}}}', {})).toBe('');
    });
  });

  describe('$attachment', () => {
    const template = '{{{$attachment attachments meta}}}';

    it('names the figure when the attachment resolves', () => {
      const html = render(template, {
        attachments: [{ id: 'f1', figure: '2' }],
        meta: [{ fileId: 'f1', originalFileName: 'plan.pdf' }],
      });

      expect(html).toBe('<em>* See appendix Figure 2</em>');
    });

    it('falls back to the file name when there is no figure', () => {
      const html = render(template, {
        attachments: [{ id: 'f1' }],
        meta: [{ fileId: 'f1', originalFileName: 'plan.pdf' }],
      });

      expect(html).toBe('<em>* See appendix plan.pdf</em>');
    });

    it('explains unsupported attachments', () => {
      const html = render(template, {
        attachments: [{ id: 'missing' }],
        meta: [],
      });

      expect(html).toContain('not supported');
    });

    it('returns an empty string when there are no attachments', () => {
      expect(render(template, {})).toBe('');
    });
  });

  describe('$debug', () => {
    it('emits JSON with HTML line breaks', () => {
      const html = render('{{$debug value}}', { value: { a: 1 } });

      expect(html).toContain('"a": 1');
    });
  });
});
