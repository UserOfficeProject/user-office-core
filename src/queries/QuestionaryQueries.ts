import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { QuestionaryStep, Questionary } from '../models/ProposalModel';
import { User } from '../models/User';
import { UserAuthorization } from '../utils/UserAuthorization';

export default class QuestionaryQueries {
  constructor(
    private dataSource: QuestionaryDataSource,
    private templateDataSource: TemplateDataSource,
    private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async getQuestionary(
    agent: User | null,
    questionaryId: number
  ): Promise<Questionary | null> {
    return this.dataSource.getQuestionary(questionaryId);
  }

  @Authorized()
  async getQuestionarySteps(
    agent: User | null,
    questionaryId: number
  ): Promise<QuestionaryStep[] | null> {
    return this.dataSource.getQuestionarySteps(questionaryId);
  }

  async getBlankQuestionary(
    agent: User | null,
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
    agent: User | null,
    templateId: number
  ): Promise<QuestionaryStep[]> {
    return this.dataSource.getBlankQuestionarySteps(templateId);
  }
}
