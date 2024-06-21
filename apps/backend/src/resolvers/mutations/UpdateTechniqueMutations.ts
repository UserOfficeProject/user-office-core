import {
  Args,
  ArgsType,
  Ctx,
  Mutation,
  Resolver,
  Field,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { Technique } from '../types/Technique';

@ArgsType()
export class UpdateTechniqueArgs {
  @Field(() => Int)
  public techniqueId: number;

  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class UpdateTechniqueMutation {
  @Mutation(() => Technique)
  async updateTechnique(
    @Args() args: UpdateTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.update(context.user, args);
  }
}
