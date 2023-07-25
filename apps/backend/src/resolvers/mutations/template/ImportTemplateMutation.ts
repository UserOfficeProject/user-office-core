import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { ConflictResolution } from '../../types/ConflictResolution';
import { Template } from '../../types/Template';

@Resolver()
export class ImportTemplateMutation {
  @Mutation(() => Template)
  importTemplate(
    @Arg('templateAsJson') templateAsJson: string,
    @Arg('conflictResolutions', () => [ConflictResolution])
    conflictResolutions: ConflictResolution[],
    @Arg('subTemplatesConflictResolutions', () => [[ConflictResolution]])
    subTemplatesConflictResolutions: ConflictResolution[][],
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.importTemplate(
      context.user,
      templateAsJson,
      conflictResolutions,
      subTemplatesConflictResolutions
    );
  }
}
