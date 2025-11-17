import { Field, ObjectType } from 'type-graphql';

import { Question } from './Question';
import { ProposalAttachments as ProposalAttachmentsOrigin } from '../../models/ProposalAttachments';

@ObjectType()
export class ProposalAttachments implements Partial<ProposalAttachmentsOrigin> {
  @Field(() => [Question], { nullable: true })
  public questions: Question[];
}
