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
    templateField: QuestionTemplateRelation,
    public value?: any
  ) {
    super(
      templateField.question,
      templateField.topicId,
      templateField.sortOrder,
      templateField.config,
      templateField.dependency
    );
  }
}

export class QuestionaryStep {
  constructor(
    public topic: Topic,
    public isCompleted: boolean,
    public fields: Answer[]
  ) {}
}

export class Questionary {
  constructor(
    public questionaryId: number | undefined,
    public templateId: number,
    public creator_id: number,
    public created: Date
  ) {}
}
