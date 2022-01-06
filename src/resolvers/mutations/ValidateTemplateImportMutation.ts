import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateImportWithValidationWrap } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@Resolver()
export class ValidateTemplateImportMutation {
  @Mutation(() => TemplateImportWithValidationWrap)
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
      TemplateImportWithValidationWrap
    );
  }
}
