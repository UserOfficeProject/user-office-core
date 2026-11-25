import 'reflect-metadata';
import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';

import { ExperimentsQuery } from './ExperimentsQuery';
import { customAuthChecker } from '../../utils/custom-auth-checker';
import { registerEnums } from '../registerEnums';

describe('Experiment safety status filter', () => {
  let schema: GraphQLSchema;
  const getExperiments = jest.fn();

  beforeAll(async () => {
    registerEnums();
    schema = await buildSchema({
      resolvers: [ExperimentsQuery],
      validate: false,
      skipCheck: true,
      authChecker: customAuthChecker,
    });
  });

  beforeEach(() => {
    getExperiments.mockReset();
    getExperiments.mockResolvedValue({ totalCount: 0, experiments: [] });
  });

  test.each(['ESF_APPROVED', 'ESF_REJECTED', 'AWAITING_ESF'])(
    'accepts the string status ID %s',
    async (experimentSafetyStatusId) => {
      const result = await graphql({
        schema,
        source: `
          query($filter: ExperimentsFilter) {
            allExperiments(filter: $filter) { totalCount }
          }
        `,
        variableValues: { filter: { experimentSafetyStatusId } },
        contextValue: {
          user: null,
          queries: { experiment: { getExperiments } },
        },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.allExperiments).toEqual({ totalCount: 0 });
      expect(getExperiments.mock.calls[0][1]).toEqual({
        experimentSafetyStatusId,
      });
    }
  );

  test('allows an unfiltered request for All', async () => {
    const result = await graphql({
      schema,
      source: '{ allExperiments { totalCount } }',
      contextValue: {
        user: null,
        queries: { experiment: { getExperiments } },
      },
    });

    expect(result.errors).toBeUndefined();
    expect(getExperiments.mock.calls[0][1]).toBeUndefined();
  });
});
