import 'reflect-metadata';
import {
  Field,
  ObjectType,
  Int,
  FieldResolver,
  Root,
  Ctx,
  Resolver,
  createUnionType,
} from 'type-graphql';

import { Tag } from './Tag';
import { ResolverContext } from '../../context';
import {
  Roles,
  UserRoleConfig as UserRoleConfigOrigin,
  ProposalReaderRoleConfig as ProposalReaderRoleConfigOrigin,
} from '../../models/Role';

@ObjectType()
export class UserRoleConfig implements Partial<UserRoleConfigOrigin> {
  @Field()
  note: string;
}

@ObjectType()
export class ProposalReaderRoleConfig
  implements Partial<ProposalReaderRoleConfigOrigin>
{
  @Field()
  hasLogAccess: boolean;

  @Field()
  hasTechnicalReviewAccess: boolean;

  @Field()
  hasFapAccess: boolean;

  @Field()
  hasAdminAccess: boolean;
}

export const RoleConfig = createUnionType({
  name: 'RoleConfig',
  types: () => [UserRoleConfig, ProposalReaderRoleConfig] as const,
  resolveType(value) {
    if ('note' in value) return UserRoleConfig;

    return ProposalReaderRoleConfig;
  },
});

export type RoleConfigValue =
  | UserRoleConfig
  | ProposalReaderRoleConfig
  | Record<string, never>;

@ObjectType()
export class Role {
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

  @Field(() => RoleConfig, { nullable: true })
  public config: RoleConfigValue;

  constructor(initObj: {
    id: number;
    shortCode: string;
    title: string;
    description: string;
    isRootRole: boolean;
    config: RoleConfigValue;
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
    return context.queries.roleTags.getTagsByRoleId(context.user, role.id);
  }

  @FieldResolver(() => RoleConfig, { nullable: true })
  config(
    @Root() role: { shortCode: string; config: unknown }
  ): UserRoleConfig | ProposalReaderRoleConfig | null {
    if (role.shortCode === Roles.USER) {
      return Object.assign(
        new UserRoleConfig(),
        role.config as UserRoleConfigOrigin
      );
    }
    if (role.shortCode === Roles.PROPOSAL_READER) {
      return Object.assign(
        new ProposalReaderRoleConfig(),
        role.config as ProposalReaderRoleConfigOrigin
      );
    }

    return null;
  }
}
