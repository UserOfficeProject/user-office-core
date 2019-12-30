import {
  Resolver,
  ObjectType,
  Ctx,
  Mutation,
  Field,
  ArgsType,
  Args,
  Int
} from "type-graphql";
import { ResolverContext } from "../../context";
import { Call } from "../../models/Call";
import { AbstractResponseWrap, wrapResponse } from "../Utils";

@ArgsType()
class CreateCallArgs {
  @Field()
  public shortCode: string;

  @Field()
  public startCall: string;

  @Field()
  public endCall: string;

  @Field()
  public startReview: string;

  @Field()
  public endReview: string;

  @Field()
  public startNotify: string;

  @Field()
  public endNotify: string;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;
}

@ObjectType()
class CreateCallResponseWrap extends AbstractResponseWrap<Call> {
  @Field(type => Call, { nullable: true })
  public call: Call;

  setValue(value: Call): void {
    this.call = value;
  }
}

const wrap = wrapResponse<Call>(new CreateCallResponseWrap());

@Resolver()
export class CreateCallMutation {
  @Mutation(() => CreateCallResponseWrap, { nullable: true })
  createCall(@Args() args: CreateCallArgs, @Ctx() context: ResolverContext) {
    return wrap(
      context.mutations.call.create(
        context.user,
        args.shortCode,
        args.startCall,
        args.endCall,
        args.startReview,
        args.endReview,
        args.startNotify,
        args.endNotify,
        args.cycleComment,
        args.surveyComment
      )
    );
  }
}
