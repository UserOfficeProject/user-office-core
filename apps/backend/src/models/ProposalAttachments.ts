import { Question } from '../resolvers/types/Question';

export class ProposalAttachments {
  constructor(public questions: Question[]) {}
}
