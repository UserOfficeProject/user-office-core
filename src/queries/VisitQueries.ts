import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { BasicUserDetails, UserWithRole } from '../models/User';
import { VisitsFilter } from '../resolvers/queries/VisitsQuery';
import { VisitAuthorization } from './../utils/VisitAuthorization';

@injectable()
export default class VisitQueries {
  constructor(
    @inject(Tokens.VisitDataSource)
    public dataSource: VisitDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    public templateDataSource: TemplateDataSource,
    @inject(Tokens.VisitAuthorization)
    public visitAuth: VisitAuthorization
  ) {}

  @Authorized([Roles.USER])
  async getVisit(agent: UserWithRole | null, id: number) {
    const hasRights = await this.visitAuth.hasReadRights(agent, id);
    if (hasRights === false) {
      return null;
    }

    return this.dataSource.getVisit(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async getVisits(agent: UserWithRole | null, filter?: VisitsFilter) {
    return this.dataSource.getVisits(filter);
  }

  @Authorized([Roles.USER])
  async getMyVisits(agent: UserWithRole | null, filter?: VisitsFilter) {
    // TODO return also visits you are part of the team
    return this.dataSource.getVisits({ ...filter, visitorId: agent!.id });
  }

  async getTeam(
    user: UserWithRole | null,
    visitId: number
  ): Promise<BasicUserDetails[]> {
    return this.dataSource.getTeam(visitId);
  }
}
