import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { ConflictResolution } from '../types/ConflictResolution';
import { wrapResponse } from '../wrapResponse';
import { TemplateResponseWrap } from './../types/CommonWrappers';

@Resolver()
export class ImportTemplateMutation {
  @Mutation(() => TemplateResponseWrap)
  importTemplate(
    @Arg('templateAsJson') templateAsJson: string,
    @Arg('conflictResolutions', () => [ConflictResolution])
    conflictResolutions: ConflictResolution[],
    @Arg('subTemplatesConflictResolutions', () => [[ConflictResolution]])
    subTemplatesConflictResolutions: ConflictResolution[][],
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.importTemplate(
        context.user,
        templateAsJson,
        conflictResolutions,
        subTemplatesConflictResolutions
      ),
      TemplateResponseWrap
    );
  }
}
