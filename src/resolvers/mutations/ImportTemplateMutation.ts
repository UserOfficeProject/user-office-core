import { Arg, Ctx, Field, InputType, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { wrapResponse } from '../wrapResponse';
import { ConflictResolutionStrategy } from './../../models/Template';
import { TemplateResponseWrap } from './../types/CommonWrappers';

@InputType()
export class ConflictResolution {
  @Field(() => String)
  questionId: string;

  @Field(() => ConflictResolutionStrategy)
  strategy: ConflictResolutionStrategy;
}

@Resolver()
export class ImportTemplateMutation {
  @Mutation(() => TemplateResponseWrap)
  importTemplate(
    @Arg('templateAsJson') templateAsJson: string,
    @Arg('conflictResolutions', () => [ConflictResolution])
    conflictResolutions: ConflictResolution[],
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.importTemplate(
        context.user,
        templateAsJson,
        conflictResolutions
      ),
      TemplateResponseWrap
    );
  }
}
