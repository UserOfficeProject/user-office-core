import 'reflect-metadata';
import {
  Field,
  ObjectType,
  Int,
  FieldResolver,
  Root,
  Ctx,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role as RoleOrigin } from '../../models/Role';
import { Tag } from './Tag';

@ObjectType()
export class Role implements Partial<RoleOrigin> {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field()
  public title: string;

  @Field()
  public description: string;

  @Field(() => Boolean)
  public isRootRole: boolean;

  @Field(() => [String])
  public permissions: string[];

  constructor(initObj: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    isRootRole: boolean;
    permissions: string[];
  }) {
    Object.assign(this, initObj);
  }
}

@Resolver(() => Role)
export class RoleResolver {
  @FieldResolver(() => [Tag], { nullable: true })
  async tags(
    @Root() role: Role,
    @Ctx() context: ResolverContext
  ): Promise<Tag[] | null> {
    const tags = await context.queries.roleTags.getTagsByRoleId(
      context.user,
      role.id
    );

    return tags;
  }
}
