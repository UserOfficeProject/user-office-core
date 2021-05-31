import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { BasicUserDetails, UserWithRole } from '../models/User';
import { VisitationsFilter } from '../resolvers/queries/VisitationsQuery';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { VisitationDataSource } from './../datasources/VisitationDataSource';
import { VisitationAuthorization } from './../utils/VisitationAuthorization';

@injectable()
export default class VisitationQueries {
  constructor(
    @inject(Tokens.VisitationDataSource)
    public dataSource: VisitationDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    public templateDataSource: TemplateDataSource,
    @inject(Tokens.VisitationAuthorization)
    public visitAuth: VisitationAuthorization
  ) {}

  @Authorized([Roles.USER])
  async getVisitation(agent: UserWithRole | null, id: number) {
    const hasRights = await this.visitAuth.hasReadRights(agent, id);
    if (hasRights === false) {
      return null;
    }

    return this.dataSource.getVisitation(id);
  }

  @Authorized([Roles.USER_OFFICER])
  async getVisitations(agent: UserWithRole | null, filter?: VisitationsFilter) {
    return this.dataSource.getVisitations(filter);
  }

  @Authorized([Roles.USER])
  async getMyVisitations(agent: UserWithRole | null) {
    // TODO return also visitations you are part of the team
    return this.dataSource.getVisitations({ visitorId: agent!.id });
  }

  async getTeam(
    user: UserWithRole | null,
    visitationId: number
  ): Promise<BasicUserDetails[]> {
    return this.dataSource.getTeam(visitationId);
  }
}
