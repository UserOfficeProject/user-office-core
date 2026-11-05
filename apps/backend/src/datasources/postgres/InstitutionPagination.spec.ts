import 'reflect-metadata';

import PostgresAdminDataSource from './AdminDataSource';
import database from './database';
import { InstitutionsPageArgs } from '../../resolvers/queries/InstitutionsPageQuery';
import { PaginationSortDirection } from '../../utils/pagination';

describe('Institution server-side pagination', () => {
  const dataSource = new PostgresAdminDataSource();
  const args: InstitutionsPageArgs = { first: 10, offset: 20 };
  const queries: { sql: string; bindings: unknown[] }[] = [];
  let records: object[];
  let totalCount: number;

  beforeEach(() => {
    queries.length = 0;
    totalCount = 31;
    records = [
      {
        institution_id: 21,
        institution: 'Institution 21',
        country_id: 173,
        ror_id: 'https://ror.org/example',
      },
    ];
    jest.spyOn(database.client, 'acquireConnection').mockResolvedValue({});
    jest
      .spyOn(database.client, 'releaseConnection')
      .mockResolvedValue(undefined);
    jest
      .spyOn(database.client, 'query')
      .mockImplementation(async (...args: unknown[]) => {
        const query = args[1];
        if (
          !query ||
          typeof query !== 'object' ||
          !('sql' in query) ||
          typeof query.sql !== 'string' ||
          !('bindings' in query) ||
          !Array.isArray(query.bindings)
        ) {
          throw new Error('Expected a compiled Knex query');
        }
        queries.push({ sql: query.sql, bindings: query.bindings });

        return {
          ...query,
          response: {
            command: 'SELECT',
            rows:
              queries.length === 1 ? [{ count: String(totalCount) }] : records,
          },
        };
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('counts all matches but only fetches the requested page', async () => {
    expect(await dataSource.getInstitutionsPage(args)).toEqual({
      totalCount: 31,
      institutions: [
        {
          id: 21,
          name: 'Institution 21',
          country: 173,
          rorId: 'https://ror.org/example',
        },
      ],
    });
    expect(queries[0].sql).not.toContain(' offset ');
    expect(queries[1].sql).toContain('limit ? offset ?');
    expect(queries[1].bindings).toEqual([10, 20]);
    expect(queries[1].sql).toContain(
      'order by institutions.institution_id=1 desc, "institutions"."institution" asc, "institutions"."institution_id" asc'
    );
  });

  test('searches name, country and ROR ID with identical filters for count and page', async () => {
    await dataSource.getInstitutionsPage({
      ...args,
      searchText: '  SwEdEn  ',
    });

    for (const query of queries) {
      expect(query.sql).toContain(
        'left join "countries" on "countries"."country_id" = "institutions"."country_id"'
      );
      expect(query.sql).toContain(
        '("institutions"."institution" ilike ? or "countries"."country" ilike ? or "institutions"."ror_id" ilike ?)'
      );
      expect(query.bindings.slice(0, 3)).toEqual([
        '%SwEdEn%',
        '%SwEdEn%',
        '%SwEdEn%',
      ]);
    }
  });

  test('ignores a whitespace-only search', async () => {
    await dataSource.getInstitutionsPage({ ...args, searchText: '   ' });

    expect(queries[0].sql).not.toContain('ilike');
    expect(queries[1].bindings).toEqual([10, 20]);
  });

  test.each([
    ['name', '"institutions"."institution"'],
    ['country.value', '"countries"."country"'],
    ['rorId', '"institutions"."ror_id"'],
  ])(
    'sorts %s on the server with a stable tie breaker',
    async (sortField, column) => {
      await dataSource.getInstitutionsPage({
        ...args,
        sortField,
        sortDirection: PaginationSortDirection.desc,
      });

      expect(queries[1].sql).toContain(
        `order by ${column} desc, "institutions"."institution_id" asc`
      );
    }
  );

  test('retains the total count when the requested page is empty', async () => {
    records = [];

    expect(await dataSource.getInstitutionsPage(args)).toEqual({
      totalCount: 31,
      institutions: [],
    });
  });

  test('returns an empty result when the search has no matches', async () => {
    records = [];
    totalCount = 0;

    expect(
      await dataSource.getInstitutionsPage({ ...args, searchText: 'missing' })
    ).toEqual({ totalCount: 0, institutions: [] });
  });

  test.each([
    { first: 0, offset: 0 },
    { first: -1, offset: 0 },
    { first: 1.5, offset: 0 },
    { first: 10, offset: -1 },
    { first: 10, offset: 0.5 },
  ])('rejects invalid pagination %j', async (args) => {
    await expect(dataSource.getInstitutionsPage(args)).rejects.toThrow(
      'Invalid institution pagination'
    );
    expect(queries).toHaveLength(0);
  });

  test.each(['unknown', '__proto__', 'name; DROP TABLE institutions'])(
    'rejects invalid sort field %s',
    async (sortField) => {
      await expect(
        dataSource.getInstitutionsPage({ ...args, sortField })
      ).rejects.toThrow('Bad sort field given');
      expect(queries).toHaveLength(0);
    }
  );
});
