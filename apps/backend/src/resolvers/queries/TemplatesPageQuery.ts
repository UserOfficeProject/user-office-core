import {
  Args,
  ArgsType,
  Ctx,
  Field,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';

import { ResolverContext } from '../../context';
import { TemplateGroupId } from '../../models/Template';
import { PaginationSortDirection } from '../../utils/pagination';

@ArgsType()
export class TemplatesPageArgs {
  @Field(() => TemplateGroupId)
  public group: TemplateGroupId;

  @Field()
  public isArchived: boolean;

  @Field(() => Int, { defaultValue: 10 })
  public first = 10;

  @Field(() => Int, { defaultValue: 0 })
  public offset = 0;

  @Field({ nullable: true })
  public searchText?: string;

  @Field({ nullable: true })
  public sortField?: string;

  @Field(() => PaginationSortDirection, { nullable: true })
  public sortDirection?: PaginationSortDirection;
}

@ObjectType()
export class TemplateListItem {
  @Field(() => Int)
  public templateId: number;

  @Field()
  public name: string;

  @Field(() => String, { nullable: true })
  public description: string;

  @Field()
  public isArchived: boolean;

  @Field(() => Int)
  public questionaryCount: number;

  @Field(() => Int)
  public callCount: number;
}

@ObjectType()
export class TemplatesPage {
  @Field(() => Int)
  public totalCount: number;

  @Field(() => [TemplateListItem])
  public templates: TemplateListItem[];
}

@Resolver()
export class TemplatesPageQuery {
  @Query(() => TemplatesPage, { nullable: true })
  templatesPage(
    @Ctx() context: ResolverContext,
    @Args() args: TemplatesPageArgs
  ) {
    return context.queries.template.getTemplatesPage(context.user, args);
  }
}
