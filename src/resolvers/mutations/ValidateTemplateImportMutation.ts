import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateValidationWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class ValidateTemplateImportMutation {
  @Mutation(() => TemplateValidationWrap)
  validateTemplateImport(
    @Arg('templateAsJson')
    templateAsJson: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.template.validateTemplateImport(
        context.user,
        templateAsJson
      ),
      TemplateValidationWrap
    );
  }
}
