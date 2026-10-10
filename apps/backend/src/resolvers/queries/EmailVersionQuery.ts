import {
  Arg,
  Ctx,
  Int,
  Query,
  Resolver,
  Field,
  ObjectType,
  ArgsType,
  Args,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateVersion } from '../types/EmailVersions';

@ObjectType()
class EmailVersionsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [TemplateVersion])
  public emailVersions: TemplateVersion[];
}

@ArgsType()
export class EmailVersionArgs {
  @Field(() => Int)
  public emailTemplateId: number;
  @Field(() => Int)
  public versionNumber: number;
}

@Resolver()
export class EmailVersionQuery {
  @Query(() => EmailVersionsQueryResult, { nullable: true })
  emailVersions(
    @Arg('emailTemplateId', () => Int) emailTemplateId: number,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.emailTemplate.getVersions(
      context.user,
      emailTemplateId
    );
  }

  @Query(() => TemplateVersion, { nullable: true })
  emailVersion(
    @Args() args: EmailVersionArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.emailTemplate.getVersion(
      context.user,
      args.emailTemplateId,
      args.versionNumber
    );
  }
}
