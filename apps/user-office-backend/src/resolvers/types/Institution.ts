import {
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Institution as InstitutionOrigin } from '../../models/Institution';
import { Entry } from './Fields';

@ObjectType()
export class Institution implements Partial<InstitutionOrigin> {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  verified: boolean;
}

@Resolver(() => Institution)
export class InstitutionResolver {
  @FieldResolver(() => Entry, { nullable: true })
  async country(
    @Root() institution: InstitutionOrigin,
    @Ctx() context: ResolverContext
  ): Promise<Entry | null> {
    return context.queries.admin.getCountry(institution.country);
  }
}
