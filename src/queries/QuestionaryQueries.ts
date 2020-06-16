import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Questionary, QuestionaryStep } from '../models/ProposalModel';
import { UserWithRole } from '../models/User';

export default class QuestionaryQueries {
  constructor(
    private dataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource
  ) {}

  @Authorized()
  async getQuestionary(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<Questionary | null> {
    return this.dataSource.getQuestionary(questionaryId);
  }

  @Authorized()
  async getQuestionarySteps(
    agent: UserWithRole | null,
    questionaryId: number
  ): Promise<QuestionaryStep[] | null> {
    return this.dataSource.getQuestionarySteps(questionaryId);
  }

  async getBlankQuestionary(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<Questionary | null> {
    return this.templateDataSource
      .getTemplate(templateId)
      .then(template =>
        template
          ? new Questionary(undefined, template.templateId, new Date())
          : null
      );
  }

  async getBlankQuestionarySteps(
    agent: UserWithRole | null,
    templateId: number
  ): Promise<QuestionaryStep[]> {
    return this.dataSource.getBlankQuestionarySteps(templateId);
  }
}
