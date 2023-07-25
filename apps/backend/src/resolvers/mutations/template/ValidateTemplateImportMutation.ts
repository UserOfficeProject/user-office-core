import { Arg, Ctx, Mutation, Resolver } from 'type-graphql';

import { ResolverContext } from '../../../context';
import { TemplateValidation } from '../../types/TemplateValidation';

@Resolver()
export class ValidateTemplateImportMutation {
  @Mutation(() => TemplateValidation)
  validateTemplateImport(
    @Arg('templateAsJson')
    templateAsJson: string,
    @Ctx() context: ResolverContext
  ) {
    return context.mutations.template.validateTemplateImport(
      context.user,
      templateAsJson
    );
  }
}
