import { ObjectType, Field, Int } from 'type-graphql';

import { FapReviewVisibility } from '../../models/Fap';

@ObjectType()
export class ReviewVisibility {
  @Field(() => Int)
  public reviewVisibilityId: number;

  @Field(() => FapReviewVisibility)
  public visibility: FapReviewVisibility;

  @Field(() => String)
  public description: string;
}
