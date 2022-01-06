import {
  AnswerBasic,
  Questionary,
  QuestionaryStep,
} from '../models/Questionary';
import { Template } from '../models/Template';

export interface QuestionaryDataSource {
  getCount(templateId: number): Promise<number>;
  getAnswer(answer_id: number): Promise<AnswerBasic | null>;
  getAnswer(
    proposalId: number,
    questionId: string
  ): Promise<AnswerBasic | null>;
  delete(questionary_id: number): Promise<Questionary>;
  getQuestionary(questionary_id: number): Promise<Questionary | null>;
  getQuestionarySteps(questionaryId: number): Promise<QuestionaryStep[]>;
  getBlankQuestionarySteps(templateId: number): Promise<QuestionaryStep[]>;
  getAnswers(questionId: string): Promise<AnswerBasic[]>;
  getTemplates(questionId: string): Promise<Template[]>;
  getIsCompleted(questionaryId: number): Promise<boolean>;
  updateAnswer(
    questionary_id: number,
    question_id: string,
    answer: string
  ): Promise<string>;
  deleteAnswers(questionary_id: number, question_ids: string[]): Promise<void>;
  updateTopicCompleteness(
    questionary_id: number,
    topic_id: number,
    isComplete: boolean
  ): Promise<void>;
  create(creator_id: number, template_id: number): Promise<Questionary>;
  clone(questionaryId: number): Promise<Questionary>;
  copyAnswers(
    sourceQuestionaryId: number,
    targetQuestionaryId: number
  ): Promise<void>;
}
