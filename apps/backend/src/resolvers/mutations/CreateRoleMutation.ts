import { Field, InputType, ObjectType } from 'type-graphql';
import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Role } from '../types/Role'; // Adjust the path as necessary

@InputType()
export class CreateRoleArgs {
  @Field()
  shortCode: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [String])
  permissions: string[];
}

@ObjectType()
export class CreateRoleResponse {
  @Field()
  success: boolean;

  @Field(() => Role, { nullable: true })
  role?: Role;
}

@Resolver()
export class CreateRoleMutation {
  @Mutation(() => CreateRoleResponse)
  async createRole(
    @Arg('args') args: CreateRoleArgs,
    @Ctx() context: ResolverContext
  ): Promise<CreateRoleResponse> {
    const role = (await context.mutations.user.createRole(
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
