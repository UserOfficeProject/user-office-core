import { Directive, Field, ObjectType } from 'type-graphql';

import { Rejection as RejectionOrig } from '../../models/Rejection';

@Directive('@key(fields: "reason")')
@ObjectType()
export class Rejection implements Partial<RejectionOrig> {
  @Field(() => String)
  public reason: string;

  @Field(() => String, { nullable: true, name: 'context' })
  public contextStr?: string;

  @Field(() => String, { nullable: true, name: 'exception' })
  public exceptionStr?: string;
}
