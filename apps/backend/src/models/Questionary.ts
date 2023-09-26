import { QuestionTemplateRelation, Topic } from './Template';

export class AnswerBasic {
  constructor(
    public answerId: number,
    public questionaryId: number,
    public questionId: string,
    public answer: any,
    public createdAt: Date
  ) {}
}

export class Answer extends QuestionTemplateRelation {
  constructor(
    public answerId: number,
    questionTemplateRelation: QuestionTemplateRelation,
    public value?: any
  ) {
    super(
      questionTemplateRelation.question,
      questionTemplateRelation.topicId,
      questionTemplateRelation.sortOrder,
      questionTemplateRelation.config,
      questionTemplateRelation.dependencies,
      questionTemplateRelation.dependenciesOperator
    );
  }
}

export class QuestionaryStep {
  constructor(
    public questionaryId: number,
    public topic: Topic,
    public isCompleted: boolean,
    public fields: Answer[]
  ) {}
}

export class Questionary {
  constructor(
    public questionaryId: number,
    public templateId: number,
    public creatorId: number,
    public created: Date
  ) {}
}

export enum QuestionFilterCompareOperator {
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  EQUALS = 'EQUALS',
  INCLUDES = 'INCLUDES',
  EXISTS = 'EXISTS',
}
