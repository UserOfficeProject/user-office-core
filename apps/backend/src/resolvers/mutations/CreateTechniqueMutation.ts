import { Args, ArgsType, Ctx, Mutation, Resolver, Field } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Technique } from '../types/Technique';

@ArgsType()
export class CreateTechniqueArgs {
  @Field(() => String)
  public name: string;

  @Field(() => String)
  public shortCode: string;

  @Field(() => String)
  public description: string;
}

@Resolver()
export class CreateTechniqueMutation {
  @Mutation(() => Technique)
  async createInstrument(
    @Args() args: CreateTechniqueArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.create(context.user, args);
  }
}
