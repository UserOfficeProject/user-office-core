import { Field, Int, ObjectType } from 'type-graphql';

import { VisitRegistrationClaim as VisitRegistrationClaimOrig } from '../../models/VisitRegistrationInvite';

@ObjectType()
export class VisitRegistrationClaim
  implements Partial<VisitRegistrationClaimOrig>
{
  @Field(() => Int)
  public userId: number;

  @Field(() => Int)
  public visitId: number;
}
