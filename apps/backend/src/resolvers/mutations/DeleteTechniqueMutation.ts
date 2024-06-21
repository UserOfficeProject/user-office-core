import { Arg, Ctx, Int, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Technique } from '../types/Technique';

@Resolver()
export class DeleteTechniqueMutation {
  @Mutation(() => Technique)
  async deleteTechnique(
    @Arg('techniqueId', () => Int) techniqueId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.delete(context.user, { techniqueId });
  }
}
