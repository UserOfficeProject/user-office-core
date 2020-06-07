import { Questionary, QuestionaryStep } from '../models/ProposalModel';

export interface QuestionaryDataSource {
  getQuestionary(questionary_id: number): Promise<Questionary>;
  getQuestionarySteps(questionaryId: number): Promise<QuestionaryStep[]>;
  getBlankQuestionarySteps(template_id: number): Promise<QuestionaryStep[]>;
  updateAnswer(
    questionary_id: number,
    question_id: string,
    answer: string
  ): Promise<string>;
  updateTopicCompletenes(
    questionary_id: number,
    topic_id: number,
    isComplete: boolean
  ): Promise<void>;
  create(template_id: number): Promise<Questionary>;
}
