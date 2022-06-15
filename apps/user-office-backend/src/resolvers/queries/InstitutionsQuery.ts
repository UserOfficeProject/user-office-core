import { Query, Arg, Ctx, Resolver, InputType, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Institution } from '../types/Institution';

@InputType()
export class InstitutionsFilter {
  @Field(() => Boolean, { nullable: true })
  public isVerified?: boolean;
}

@Resolver()
export class InstitutionsQuery {
  @Query(() => [Institution], { nullable: true })
  institutions(
    @Ctx() context: ResolverContext,
    @Arg('filter', () => InstitutionsFilter, { nullable: true })
    filter: InstitutionsFilter
  ) {
    return context.queries.admin.getInstitutions(filter);
  }
}
