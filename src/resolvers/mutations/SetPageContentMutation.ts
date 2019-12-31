import { Resolver, ObjectType, Ctx, Mutation, Field, Arg } from "type-graphql";
import { ResolverContext } from "../../context";
import { PageName } from "../../models/Page";
import { Page } from "../../models/Admin";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ObjectType()
class SetPageContentResponseWrap extends AbstractResponseWrap<Page> {
  @Field({ nullable: true })
  public page: Page;

  setValue(value: Page): void {
    this.page = value;
  }
}

const wrap = wrapResponse<Page>(new SetPageContentResponseWrap());

@Resolver()
export class SetPageContentMutation {
  @Mutation(() => SetPageContentResponseWrap, { nullable: true })
  setPageContent(
    @Arg("id", () => PageName) id: PageName,
    @Arg("text", () => String) text: string,
    @Ctx() context: ResolverContext
  ) {
    return wrap(context.mutations.admin.setPageText(context.user, id, text));
  }
}
