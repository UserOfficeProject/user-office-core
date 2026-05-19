import { Field, InputType, Resolver, Mutation, Arg, Ctx } from 'type-graphql';

import { RoleConfigInput } from './RoleConfigInput';
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

  @Field(() => RoleConfigInput, { nullable: true })
  config?: RoleConfigInput;
}

@Resolver()
export class CreateRoleMutation {
  @Mutation(() => Role)
  async createRole(
    @Arg('args') args: CreateRoleArgs,
    @Ctx() context: ResolverContext
  ): Promise<Role | Rejection> {
    const role = await context.mutations.role.createRole(context.user, args);

    return role;
  }
}
