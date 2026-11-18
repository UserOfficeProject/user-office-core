import {
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
