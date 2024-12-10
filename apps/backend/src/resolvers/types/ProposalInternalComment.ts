import { ArgsType, Field, Int, ObjectType } from 'type-graphql';

import { ProposalInternalComment as ProposalInternalCommentOrigin } from '../../models/ProposalInternalComment';
@ObjectType()
export class ProposalInternalComment
  implements Partial<ProposalInternalCommentOrigin>
{
  @Field(() => Int)
  public commentId: number;

  @Field(() => Int)
  public proposalPk: number;

  @Field(() => String)
  public comment: string;
}

@ArgsType()
export class CreateProposalInternalCommentArgs {
  @Field(() => Int)
  proposalPk: number;

  @Field(() => String)
  comment: string;
}

@ArgsType()
export class UpdateProposalInternalCommentArgs {
  @Field(() => Int)
  commentId: number;

  @Field(() => String)
  comment: string;
}
