import {
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Int,
  ObjectType,
  Resolver,
  Root,
} from 'type-graphql';

import { InvitedProposal } from './Proposal';
import { ResolverContext } from '../../context';
import { Invite as InviteOrigin } from '../../models/Invite';
import { Roles } from '../../models/Role';

@ObjectType()
export class Invite implements Partial<InviteOrigin> {
  @Field(() => Int)
  public id: number;

  @Field(() => String, { nullable: true })
  @Authorized([Roles.USER_OFFICER])
  public code: string;

  @Field()
  public email: string;

  @Field()
  public createdAt: Date;

  @Field(() => Int)
  public createdByUserId: number;

  @Field(() => Date, { nullable: true })
  public claimedAt: Date | null;

  @Field(() => Int, { nullable: true })
  public claimedByUserId: number | null;

  @Field(() => Boolean)
  public isEmailSent: boolean;

  @Field(() => Date, { nullable: true })
  public expiresAt: Date | null;
}

@Resolver(() => Invite)
export class InviteResolver {
  @FieldResolver(() => InvitedProposal, { nullable: true })
  async proposal(@Root() invite: Invite, @Ctx() context: ResolverContext) {
    return context.queries.proposal.dataSource.getInvitedProposal(invite.id);
  }
}
