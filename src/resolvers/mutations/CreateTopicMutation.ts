import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  Int,
  Arg
} from "type-graphql";
import { ResolverContext } from "../../context";
import { wrapResponse, AbstractResponseWrap } from "../Utils";
import { ProposalTemplate } from "../../models/ProposalModel";

@ObjectType()
class CreateTopicResponseWrap extends AbstractResponseWrap<ProposalTemplate> {
  @Field({ nullable: true })
  public template: ProposalTemplate;

  setValue(value: ProposalTemplate): void {
    this.template = value;
  }
}

const wrap = wrapResponse<ProposalTemplate>(new CreateTopicResponseWrap());

@Resolver()
export class CreateTopicMutation {
  @Mutation(() => CreateTopicResponseWrap)
  createTopic(
    @Arg("sortOrder", () => Int) sortOrder: number,
    @Ctx() context: ResolverContext
  ) {
    return wrap(
      context.mutations.template.createTopic(context.user, sortOrder)
    );
  }
}
