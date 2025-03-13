import { Field, ObjectType } from 'type-graphql';

import { ProposalAttachments as ProposalAttachmentsOrigin } from '../../models/ProposalAttachments';
import { Question } from './Question';

@ObjectType()
export class ProposalAttachments implements Partial<ProposalAttachmentsOrigin> {
  @Field(() => [Question], { nullable: true })
  public questions: Question[];
}
