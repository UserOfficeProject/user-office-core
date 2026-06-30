import { Directive, Field, InputType } from 'type-graphql';

@InputType()
export class UserRoleConfigInput {
  @Field()
  note: string;
}

@InputType()
export class ProposalReaderRoleConfigInput {
  @Field(() => Boolean)
  hasLogAccess: boolean;

  @Field(() => Boolean)
  hasTechnicalReviewAccess: boolean;

  @Field(() => Boolean)
  hasFapAccess: boolean;

  @Field(() => Boolean)
  hasAdminAccess: boolean;
}

@InputType()
@Directive('@oneOf')
export class RoleConfigInput {
  @Field(() => UserRoleConfigInput, { nullable: true })
  user?: UserRoleConfigInput | null;

  @Field(() => ProposalReaderRoleConfigInput, { nullable: true })
  proposalReader?: ProposalReaderRoleConfigInput | null;
}
