import { stripHtml } from './stringStripHtml';

describe('stripHtml', () => {
  it.each([
    ['<p>Hello</p>', 'Hello'],
    ['Alpha&nbsp;&amp;&nbsp;Beta', 'Alpha\u00A0&\u00A0Beta'],
    ['<div>Hello <strong>world</strong></div>', 'Hello world'],
    ['<p>First</p><p>Second</p>', 'First Second'],
    ['<div>Line 1<br>Line 2</div>', 'Line 1 Line 2'],
    ['<style>.x{color:red}</style><p>Hi</p>', 'Hi'],
    ['plain text', 'plain text'],
    ['before < invalid > after', 'before < invalid > after'],
    ['', ''],
  ])('returns the expected result for %p', (input, expectedResult) => {
    expect(stripHtml(input)).toBe(expectedResult);
  });
});
