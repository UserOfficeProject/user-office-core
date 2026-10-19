import {
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
import { TemplateVersion } from '../types/TemplateVersions';

@ObjectType()
class EmailVersionsQueryResult {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [TemplateVersion])
  public versions: TemplateVersion[];
}

@ArgsType()
export class EmailVersionArgs {
  @Field(() => Int)
  public templateId: number;
  @Field(() => Int, { nullable: true })
  public versionNumber: number;
  @Field(() => String, { nullable: true })
  public templateType: string;
}

@Resolver()
export class EmailVersionQuery {
  @Query(() => EmailVersionsQueryResult, { nullable: true })
  async templateVersions(
    @Args() args: EmailVersionArgs,
    @Ctx() context: ResolverContext
  ) {
    const t = await context.queries.templateVersions.getVersions(
      context.user,
      args.templateId,
      args.templateType
    );

    return t;
  }

  @Query(() => TemplateVersion, { nullable: true })
  templateVersion(
    @Args() args: EmailVersionArgs,
    @Ctx() context: ResolverContext
  ) {
    return context.queries.templateVersions.getVersion(
      context.user,
      args.templateId,
      args.versionNumber,
      args.templateType
    );
  }
}
