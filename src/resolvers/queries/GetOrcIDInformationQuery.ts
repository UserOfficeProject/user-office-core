import { Arg, Ctx, Query, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { OrcIDInformation } from '../types/OrcIDInformation';

@Resolver()
export class GetOrcIDInformationQuery {
  @Query(() => OrcIDInformation, { nullable: true })
  getOrcIDInformation(
    @Arg('authorizationCode') authorizationCode: string,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.getOrcIDInformation(authorizationCode);
  }
}
