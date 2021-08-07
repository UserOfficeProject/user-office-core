import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { RiskAssessmentDataSource } from '../datasources/RiskAssessmentDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { UserWithRole } from '../models/User';
import { RiskAssessmentAuthorization } from '../utils/RiskAssessmentAuthorization';
import { UserAuthorization } from './../utils/UserAuthorization';

export interface RiskAssessmentsFilter {
  proposalPk?: number;
  questionaryIds?: number[];
}

@injectable()
export default class RiskAssessmentQueries {
  constructor(
    @inject(Tokens.RiskAssessmentDataSource)
    public dataSource: RiskAssessmentDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    public templateDataSource: TemplateDataSource,
    @inject(Tokens.RiskAssessmentAuthorization)
    public riskAssessmentAuth: RiskAssessmentAuthorization,
    @inject(Tokens.UserAuthorization)
    public userAuth: UserAuthorization
  ) {}

  @Authorized()
  async getRiskAssessment(agent: UserWithRole | null, id: number) {
    const hasRights = await this.riskAssessmentAuth.hasReadRights(agent, id);
    if (hasRights === false) {
      return null;
    }

    return this.dataSource.getRiskAssessment(id);
  }

  @Authorized()
  async getRiskAssessments(
    agent: UserWithRole | null,
    filter: RiskAssessmentsFilter
  ) {
    let riskAssessments = await this.dataSource.getRiskAssessments(filter);

    riskAssessments = await Promise.all(
      riskAssessments.map((ra) =>
        this.riskAssessmentAuth.hasReadRights(agent, ra.riskAssessmentId)
      )
    ).then((results) => riskAssessments.filter((_v, index) => results[index]));

    return riskAssessments;
  }
}
