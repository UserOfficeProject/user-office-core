import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Mutation,
  Resolver,
  Int,
} from 'type-graphql';

import { ResolverContext } from '../../context';

@ArgsType()
export class AssignProposalToTechniquesArgs {
  @Field(() => Int)
  public proposalPk: number;

  @Field(() => [Int])
  public techniqueIds: number[];
}

@Resolver()
export class AssignProposalToTechniquesMutation {
  @Mutation(() => Boolean)
  async assignProposalToTechniques(
    @Args() args: AssignProposalToTechniquesArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.technique.assignProposalToTechniques(
      context.user,
      args
    );
  }
}
