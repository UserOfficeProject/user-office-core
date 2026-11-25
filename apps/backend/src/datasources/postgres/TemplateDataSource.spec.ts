import 'reflect-metadata';

import database from './database';
import PostgresTemplateDataSource from './TemplateDataSource';
import { TemplateGroupId } from '../../models/Template';
import { TemplatesPageArgs } from '../../resolvers/queries/TemplatesPageQuery';
import { PaginationSortDirection } from '../../utils/pagination';

describe('Template server-side pagination', () => {
  const dataSource = new PostgresTemplateDataSource();
  const args: TemplatesPageArgs = {
    group: TemplateGroupId.PROPOSAL,
    isArchived: false,
    first: 10,
    offset: 20,
  };
  const queries: { sql: string; bindings: unknown[] }[] = [];
  let records: object[];
  let totalCount: number;

  beforeEach(() => {
    queries.length = 0;
    totalCount = 31;
    records = [
      {
        template_id: 21,
        group_id: TemplateGroupId.PROPOSAL,
        name: 'Template 21',
        description: 'Description',
        is_archived: false,
        questionary_count: '3',
        call_count: '2',
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

  test('limits and offsets rows in SQL while counting all matching templates', async () => {
    const result = await dataSource.getTemplatesPage(args);

    expect(result).toEqual({
      totalCount: 31,
      templates: [
        {
          templateId: 21,
          groupId: TemplateGroupId.PROPOSAL,
          name: 'Template 21',
          description: 'Description',
          isArchived: false,
          questionaryCount: 3,
          callCount: 2,
        },
      ],
    });
    expect(queries[0].sql).not.toContain(' offset ');
    expect(queries[0].bindings).toEqual([TemplateGroupId.PROPOSAL, false, 1]);
    expect(queries[1].sql).toContain('limit ? offset ?');
    expect(queries[1].bindings).toEqual([
      TemplateGroupId.PROPOSAL,
      false,
      10,
      20,
    ]);
    expect(queries[1].sql).toContain(
      'order by "templates"."name" ASC, "templates"."template_id" asc'
    );
  });

  test('searches names and descriptions with the same filters for count and page', async () => {
    await dataSource.getTemplatesPage({
      ...args,
      isArchived: true,
      searchText: '  Industrial  ',
    });

    for (const query of queries) {
      expect(query.sql).toContain(
        '("templates"."name" ilike ? or "templates"."description" ilike ?)'
      );
      expect(query.bindings.slice(0, 4)).toEqual([
        TemplateGroupId.PROPOSAL,
        true,
        '%Industrial%',
        '%Industrial%',
      ]);
    }
  });

  test.each([
    [TemplateGroupId.PROPOSAL, 'template_id'],
    [TemplateGroupId.PROPOSAL_ESI, 'esi_template_id'],
    [TemplateGroupId.FAP_REVIEW, 'fap_review_template_id'],
    [TemplateGroupId.TECHNICAL_REVIEW, 'technical_review_template_id'],
    [TemplateGroupId.PROPOSAL_PDF, 'proposal_pdf_template_id'],
    [
      TemplateGroupId.EXPERIMENT_SAFETY_PDF,
      'experiment_safety_pdf_template_id',
    ],
  ])('counts call usage for %s', async (group, column) => {
    await dataSource.getTemplatesPage({ ...args, group });

    expect(queries[1].sql).toContain(
      `"call"."${column}" = "templates"."template_id"`
    );
    expect(queries[1].sql).toContain(
      '"questionaries"."template_id" = "templates"."template_id"'
    );
  });

  test('returns zero call usage for categories not referenced by calls', async () => {
    await dataSource.getTemplatesPage({
      ...args,
      group: TemplateGroupId.SAMPLE,
    });

    expect(queries[1].sql).toContain('0 AS call_count');
  });

  test.each([
    ['name', '"templates"."name"'],
    ['description', '"templates"."description"'],
    ['questionaryCount', '"questionary_count"'],
    ['callCount', '"call_count"'],
  ])(
    'sorts %s on the server with a stable tie breaker',
    async (sortField, column) => {
      await dataSource.getTemplatesPage({
        ...args,
        sortField,
        sortDirection: PaginationSortDirection.desc,
      });

      expect(queries[1].sql).toContain(
        `order by ${column} DESC, "templates"."template_id" asc`
      );
    }
  );

  test('preserves total count when the requested page is empty', async () => {
    records = [];

    expect(await dataSource.getTemplatesPage(args)).toEqual({
      totalCount: 31,
      templates: [],
    });
  });

  test('returns an empty result for a search with no matches', async () => {
    records = [];
    totalCount = 0;

    expect(await dataSource.getTemplatesPage(args)).toEqual({
      totalCount: 0,
      templates: [],
    });
  });

  test.each([
    { first: 0 },
    { first: -1 },
    { first: 1.5 },
    { offset: -1 },
    { offset: 1.5 },
    { sortField: 'invalid' },
    { sortField: 'toString' },
  ])('rejects invalid pagination or sorting: %s', async (invalidArgs) => {
    await expect(
      dataSource.getTemplatesPage({ ...args, ...invalidArgs })
    ).rejects.toThrow();
    expect(queries).toHaveLength(0);
  });
});
