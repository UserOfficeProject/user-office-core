import { Field, Int, ArgsType, InputType } from 'type-graphql';

import { UserRole } from '../../models/User';

@InputType()
export class AddSEPMembersRole {
  @Field(() => [Int])
  userIDs: number[];

  @Field(() => UserRole)
  roleID: UserRole;

  @Field(() => Int)
  SEPID: number;
}

@ArgsType()
export class AddSEPMembersRoleArgs {
  @Field(() => AddSEPMembersRole, { nullable: true })
  public addSEPMembersRole: AddSEPMembersRole;
}
