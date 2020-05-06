import {
  ObjectType,
  Field,
  Int,
  Resolver,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { BasicUserDetails } from './BasicUserDetails';
import { Role } from './Role';

@ObjectType()
export class SEPMember {
  @Field(() => Int)
  public roleUserId: number;

  @Field(() => Int)
  public roleId: number;

  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public sepId: number;
}

@Resolver(() => SEPMember)
export class SEPUserResolver {
  @FieldResolver(() => [Role])
  async roles(@Root() sepMember: SEPMember, @Ctx() context: ResolverContext) {
    return context.queries.sep.dataSource.getSEPUserRoles(
      sepMember.userId,
      sepMember.sepId
    );
  }

  @FieldResolver(() => BasicUserDetails)
  async user(@Root() sepMember: SEPMember, @Ctx() context: ResolverContext) {
    return context.queries.user.dataSource.getBasicUserInfo(sepMember.userId);
  }
}
