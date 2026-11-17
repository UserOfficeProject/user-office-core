import { GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { Query, Resolver, buildSchema } from 'type-graphql';

import { BasicUserDetails } from './BasicUserDetails';
import { BasicUserDetails as BasicUserDetailsModel } from '../../models/User';

let user: BasicUserDetailsModel;

@Resolver()
class BasicUserDetailsTestResolver {
  @Query(() => BasicUserDetails)
  basicUserDetails(): BasicUserDetailsModel {
    return user;
  }
}

describe('BasicUserDetails schema', () => {
  let schema: GraphQLSchema;

  beforeAll(async () => {
    schema = await buildSchema({
      resolvers: [BasicUserDetailsTestResolver],
      authChecker: () => true,
      validate: false,
    });
  });

  beforeEach(() => {
    user = new BasicUserDetailsModel(
      1,
      'Jane',
      'Doe',
      'Jane',
      'Test Institution',
      2,
      new Date('2026-01-01'),
      'jane@example.com',
      'Sweden',
      'Dr',
      null,
      'https://ror.org/01wv9cn34'
    );
  });

  test('Deprecates institution in favor of institutionName', () => {
    const userType = schema.getType('BasicUserDetails') as GraphQLObjectType;
    const fields = userType.getFields();

    expect(fields.institution.deprecationReason).toBe(
      'Use institutionName instead.'
    );
    expect(fields.institutionName.deprecationReason).toBeUndefined();
    expect(fields.institutionId.type.toString()).toBe('Int!');
  });

  test('Returns new institution fields alongside legacy fields', async () => {
    const result = await graphql({
      schema,
      source: `{
        basicUserDetails {
          institution
          institutionName
          institutionId
          institutionRorId
          institutionCountry
          country
        }
      }`,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.basicUserDetails).toEqual({
      institution: 'Test Institution',
      institutionName: 'Test Institution',
      institutionId: 2,
      institutionRorId: 'https://ror.org/01wv9cn34',
      institutionCountry: 'Sweden',
      country: 'Sweden',
    });
  });

  test('Returns null for unavailable institution metadata without losing the user', async () => {
    user.institutionRorId = null;
    user.institutionCountry = null;

    const result = await graphql({
      schema,
      source: `{
        basicUserDetails {
          id
          institutionName
          institutionRorId
          institutionCountry
        }
      }`,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.basicUserDetails).toEqual({
      id: 1,
      institutionName: 'Test Institution',
      institutionRorId: null,
      institutionCountry: null,
    });
  });
});
