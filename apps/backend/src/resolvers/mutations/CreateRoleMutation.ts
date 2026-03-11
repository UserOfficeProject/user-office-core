import { Field, InputType } from 'type-graphql';
import { Resolver, Mutation, Arg, Ctx } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Rejection } from '../types/Rejection';
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

@Resolver()
export class CreateRoleMutation {
  @Mutation(() => Role)
  async createRole(
    @Arg('args') args: CreateRoleArgs,
    @Ctx() context: ResolverContext
  ): Promise<Role | Rejection> {
    const role = await context.mutations.user.createRole(context.user, args);

    return role;
  }
}
