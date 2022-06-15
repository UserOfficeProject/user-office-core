import { Arg, Ctx, Field, Mutation, ObjectType, Resolver } from 'type-graphql';

import { ResolverContext } from '../../context';
import { Response } from '../Decorators';
import { ResponseWrapBase } from '../types/CommonWrappers';
import { wrapResponse } from '../wrapResponse';

@ObjectType()
class EmailVerificationResponseWrap extends ResponseWrapBase {
  @Response()
  @Field({ nullable: true })
  public success: boolean;
}

@Resolver()
export class EmailVerificationMutation {
  @Mutation(() => EmailVerificationResponseWrap)
  emailVerification(
    @Arg('token') token: string,
    @Ctx() context: ResolverContext
  ) {
    return wrapResponse(
      context.mutations.user.emailVerification(token),
      EmailVerificationResponseWrap
    );
  }
}
