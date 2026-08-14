import {
  buildSubstitutionData,
  getEmailTemplateFilePath,
  renderEmailTemplate,
} from './emailTemplateRenderer';

describe('renderEmailTemplate', () => {
  it('renders subject and body with substitution data', () => {
    const result = renderEmailTemplate(
      { subject: '= `Review for ${proposalNumber}`', body: 'p #{title}' },
      { proposalNumber: 42, title: 'A proposal' }
    );

    expect(result).toEqual({
      subject: 'Review for 42',
      body: '<p>A proposal</p>',
    });
  });

  it('renders nested and array data for loops', () => {
    const result = renderEmailTemplate(
      { subject: '', body: 'each name in names\n  p #{name}' },
      { names: ['Jane', 'Bob'] }
    );

    expect(result).toEqual({
      subject: '',
      body: '<p>Jane</p><p>Bob</p>',
    });
  });

  it('returns a BODY error instead of throwing on a pug syntax error', () => {
    const result = renderEmailTemplate({ subject: '', body: 'p #{' }, {});

    expect(result).toHaveProperty('error');
    expect('error' in result && result.error.source).toBe('BODY');
    expect('error' in result && typeof result.error.line).toBe('number');
  });

  it('attributes a subject error to SUBJECT', () => {
    const result = renderEmailTemplate({ subject: 'p #{', body: '' }, {});

    expect('error' in result && result.error.source).toBe('SUBJECT');
  });

  it('does not let a template read files via include', () => {
    const result = renderEmailTemplate(
      { subject: '', body: 'include /etc/passwd' },
      {}
    );

    expect(result).toHaveProperty('error');
  });

  it('renders normally even though NODE_ENV is test', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(renderEmailTemplate({ subject: '', body: 'p hi' }, {})).toEqual({
      subject: '',
      body: '<p>hi</p>',
    });
  });
});

describe('getEmailTemplateFilePath', () => {
  const originalPath = process.env.EMAIL_TEMPLATE_PATH;

  beforeAll(() => {
    process.env.EMAIL_TEMPLATE_PATH = '/config/emails';
  });

  afterAll(() => {
    process.env.EMAIL_TEMPLATE_PATH = originalPath;
  });

  it('builds a path inside the template root', () => {
    expect(getEmailTemplateFilePath('html', 'review-reminder')).toBe(
      '/config/emails/review-reminder.html.pug'
    );
    expect(getEmailTemplateFilePath('subject', 'review-reminder')).toBe(
      '/config/emails/review-reminder.subject.pug'
    );
  });

  it.each([
    '../../etc/passwd',
    '../../../../proc/self/environ',
    'foo/../../bar',
    '/etc/passwd',
    'foo bar',
  ])('rejects the traversal/invalid name %p', (name) => {
    expect(() => getEmailTemplateFilePath('html', name)).toThrow();
  });
});

describe('buildSubstitutionData', () => {
  it('builds a flat map', () => {
    expect(
      buildSubstitutionData([{ key: 'proposalTitle', value: 'A title' }])
    ).toEqual({ proposalTitle: 'A title' });
  });

  it('nests dotted keys', () => {
    expect(
      buildSubstitutionData([
        { key: 'proposal.title', value: 'A title' },
        { key: 'proposal.number', value: '42' },
      ])
    ).toEqual({ proposal: { title: 'A title', number: '42' } });
  });

  it('parses JSON-looking values so loops can be previewed', () => {
    expect(
      buildSubstitutionData([{ key: 'coProposers', value: '["Jane","Bob"]' }])
    ).toEqual({ coProposers: ['Jane', 'Bob'] });
  });

  it('falls back to the raw string when JSON is malformed', () => {
    expect(buildSubstitutionData([{ key: 'a', value: '[not json' }])).toEqual({
      a: '[not json',
    });
  });

  it.each(['__proto__', 'constructor', 'prototype'])(
    'drops the forbidden key %p',
    (key) => {
      expect(buildSubstitutionData([{ key, value: 'x' }])).toEqual({});
    }
  );

  it('does not pollute Object.prototype', () => {
    buildSubstitutionData([{ key: '__proto__.polluted', value: 'yes' }]);

    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('drops keys that are not valid identifiers', () => {
    expect(
      buildSubstitutionData([
        { key: '1bad', value: 'x' },
        { key: 'has-dash', value: 'x' },
        { key: '', value: 'x' },
      ])
    ).toEqual({});
  });

  // Regression: writing a sample value through a key whose parent already holds
  // a JSON array used to throw RangeError (assigning to Array.prototype.length),
  // which surfaced as a GraphQL error rather than an in-payload preview error.
  it('does not throw when a key descends through an array value', () => {
    expect(() =>
      buildSubstitutionData([
        { key: 'coProposers', value: '["Jane","Bob"]' },
        { key: 'coProposers.length', value: '2' },
      ])
    ).not.toThrow();
  });

  it('keeps the existing value when a key descends through a non-object', () => {
    expect(
      buildSubstitutionData([
        { key: 'coProposers', value: '["Jane","Bob"]' },
        { key: 'coProposers.length', value: '2' },
      ])
    ).toEqual({ coProposers: ['Jane', 'Bob'] });

    expect(
      buildSubstitutionData([
        { key: 'title', value: 'A title' },
        { key: 'title.nested', value: 'x' },
      ])
    ).toEqual({ title: 'A title' });
  });

  it('truncates long values and caps the number of variables', () => {
    const long = buildSubstitutionData([{ key: 'a', value: 'x'.repeat(5000) }]);
    expect((long.a as string).length).toBe(2000);

    const many = Array.from({ length: 300 }, (_, i) => ({
      key: `k${i}`,
      value: 'v',
    }));
    expect(Object.keys(buildSubstitutionData(many)).length).toBe(200);
  });
});
