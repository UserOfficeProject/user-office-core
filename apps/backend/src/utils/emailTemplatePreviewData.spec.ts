import {
  buildEmailTemplatePreviewData,
  buildSubstitutionData,
} from './emailTemplatePreviewData';

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

describe('buildEmailTemplatePreviewData', () => {
  it('uses proposal workflow preview data for generated variable placeholders', () => {
    const result = buildEmailTemplatePreviewData([
      { key: 'proposals', value: 'proposals' },
      { key: 'instruments', value: 'instruments' },
      { key: 'technicalReviews', value: 'technicalReviews' },
      { key: 'call.startCall', value: 'call.startCall' },
    ]);

    expect(Array.isArray(result.proposals)).toBe(true);
    expect(Array.isArray(result.instruments)).toBe(true);
    expect(Array.isArray(result.technicalReviews)).toBe(true);
    expect(result.call).toMatchObject({ startCall: expect.any(Date) });
  });

  it('preserves supplied JSON sample data', () => {
    const instruments = [{ id: 7, name: 'Custom instrument' }];

    const result = buildEmailTemplatePreviewData([
      { key: 'instruments', value: JSON.stringify(instruments) },
    ]);

    expect(result.instruments).toEqual(instruments);
  });
});
