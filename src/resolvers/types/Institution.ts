import { Field, Int, ObjectType } from 'type-graphql';

import { Institution as InstitutionOrigin } from '../../models/Institution';

@ObjectType()
export class Institution implements Partial<InstitutionOrigin> {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  verified: boolean;
}
