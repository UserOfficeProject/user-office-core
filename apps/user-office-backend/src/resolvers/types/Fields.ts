import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ObjectType()
export class Fields {}

@ObjectType()
export class Entry {
  @Field(() => Int)
  id: number;

  @Field()
  value: string;
}

@Resolver((of) => Fields)
export class FieldsResolver {
  @FieldResolver(() => [Entry])
  async nationalities(@Ctx() context: ResolverContext): Promise<Entry[]> {
    return context.queries.admin.getNationalities();
  }

  @FieldResolver(() => [Entry])
  async countries(@Ctx() context: ResolverContext): Promise<Entry[]> {
    return context.queries.admin.getCountries();
  }
}
