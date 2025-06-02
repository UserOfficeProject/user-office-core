import { Field, InputType, Int, ObjectType } from 'type-graphql';
import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role } from '../types/Role'; // Adjust the path as necessary

@InputType()
export class UpdateRoleArgs {
  @Field(() => Int)
  public roleID: number;

  @Field()
  shortCode: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [String])
  permissions: string[];

  @Field(() => [String])
  dataAccess: string[];
}

@ObjectType()
export class UpdateRoleResponse {
  @Field()
  success: boolean;

  @Field(() => Role, { nullable: true })
  role?: Role;
}

@Resolver()
export class UpdateRoleMutation {
  @Mutation(() => UpdateRoleResponse)
  async updateRole(
    @Arg('args') args: UpdateRoleArgs,
    @Ctx() context: ResolverContext
  ): Promise<UpdateRoleResponse> {
    const role = (await context.mutations.user.updateRole(
      context.user,
      args
    )) as Role | Error;
    if (role instanceof Error) {
      return {
        success: false,
        role: undefined,
      };
    }

    return {
      success: true,
      role,
    };
  }
}
