import Handlebars from 'handlebars';

import { createTemplateEngine, renderHtml } from './renderHtml';

describe('renderHtml', () => {
  it('substitutes values into the template', () => {
    expect(
      renderHtml('<p>{{proposal.title}}</p>', { proposal: { title: 'X' } })
    ).toBe('<p>X</p>');
  });

  it('escapes HTML in values but not in triple-stash values', () => {
    const data = { value: '<b>bold</b>' };

    expect(renderHtml('{{value}}', data)).toBe('&lt;b&gt;bold&lt;/b&gt;');
    expect(renderHtml('{{{value}}}', data)).toBe('<b>bold</b>');
  });

  it('reports a parse failure with the template message', () => {
    expect(() => renderHtml('{{#if}}', {})).toThrow(
      /Failed to parse Handlebars template/
    );
  });

  it('reports a render failure separately from a parse failure', () => {
    const engine = createTemplateEngine();
    engine.registerHelper('$explode', () => {
      throw new Error('boom');
    });

    expect(() => renderHtml('{{$explode}}', {}, engine)).toThrow(
      /Failed to render Handlebars template: boom/
    );
  });

  it('does not register helpers on the global Handlebars object', () => {
    createTemplateEngine();

    expect(Handlebars.helpers['$eq']).toBeUndefined();
  });
});
