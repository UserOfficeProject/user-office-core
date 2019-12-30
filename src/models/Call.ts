import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
export class Call {
  @Field(() => Int)
  public id: number;

  @Field()
  public shortCode: string;

  @Field(() => Date)
  public startCall: Date;

  @Field(() => Date)
  public endCall: Date;

  @Field(() => Date)
  public startReview: Date;

  @Field(() => Date)
  public endReview: Date;

  @Field(() => Date)
  public startNotify: Date;

  @Field(() => Date)
  public endNotify: Date;

  @Field()
  public cycleComment: string;

  @Field()
  public surveyComment: string;

  constructor(
    id: number,
    shortCode: string,
    startCall: Date,
    endCall: Date,
    startReview: Date,
    endReview: Date,
    startNotify: Date,
    endNotify: Date,
    cycleComment: string,
    surveyComment: string
  ) {
    this.id = id;
    this.shortCode = shortCode;
    this.startCall = startCall;
    this.endCall = endCall;
    this.startReview = startReview;
    this.endReview = endReview;
    this.startNotify = startNotify;
    this.endNotify = endNotify;
    this.cycleComment = cycleComment;
    this.surveyComment = surveyComment;
  }
}
