import {
  Ctx,
  Directive,
  FieldResolver,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { BasicUserDetails } from './BasicUserDetails';
import { Role } from './Role';
import { ResolverContext } from '../../context';

@ObjectType()
@Directive('@key(fields: "id")')
export class BasicUserDetailsWithRoles extends BasicUserDetails {}

@Resolver(() => BasicUserDetailsWithRoles)
export class BasicUserDetailsWithRolesResolver {
  @FieldResolver(() => [Role])
  async roles(
    @Root() user: BasicUserDetailsWithRoles,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.user.dataSource.getUserRoles(user.id);
  }
}
