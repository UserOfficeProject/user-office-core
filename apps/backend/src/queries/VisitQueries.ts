import { container, inject, injectable } from 'tsyringe';

import { UserAuthorization } from '../auth/UserAuthorization';
import { VisitAuthorization } from '../auth/VisitAuthorization';
import { VisitRegistrationAuthorization } from '../auth/VisitRegistrationAuthorization';
import { Tokens } from '../config/Tokens';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { VisitRegistration } from '../models/VisitRegistration';
import { VisitsFilter } from '../resolvers/queries/VisitsQuery';
export interface GetRegistrationsFilter {
  questionaryIds?: number[];
  visitId?: number;
}

@injectable()
export default class VisitQueries {
  private visitAuth = container.resolve(VisitAuthorization);
  private visitRegistrationAuth = container.resolve(
    VisitRegistrationAuthorization
  );

  constructor(
    @inject(Tokens.VisitDataSource)
    public dataSource: VisitDataSource,
    @inject(Tokens.QuestionaryDataSource)
    public questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    public templateDataSource: TemplateDataSource,
    @inject(Tokens.UserAuthorization) private userAuth: UserAuthorization
  ) {}

  @Authorized()
  async getVisit(agent: UserWithRole | null, id: number) {
    const visit = await this.dataSource.getVisit(id);
    if (!visit) {
      return null;
    }
    const hasRights =
      this.userAuth.isApiToken(agent) ||
      (await this.visitAuth.hasReadRights(agent, visit));
    if (hasRights === false) {
      return null;
    }

    return visit;
  }

  @Authorized([Roles.USER_OFFICER])
  async getVisits(agent: UserWithRole | null, filter?: VisitsFilter) {
    return this.dataSource.getVisits(filter);
  }

  @Authorized()
  async getMyVisits(agent: UserWithRole | null, filter?: VisitsFilter) {
    // TODO return also visits you are part of the team
    return this.dataSource.getVisits({ ...filter, creatorId: agent!.id });
  }

  async getRegistrations(
    user: UserWithRole | null,
    filter: GetRegistrationsFilter
  ): Promise<VisitRegistration[]> {
    return this.dataSource.getRegistrations(filter);
  }

  @Authorized()
  async getRegistration(
    agent: UserWithRole | null,
    visitId: number,
    userId: number
  ): Promise<VisitRegistration | null> {
    const hasReadRights =
      this.userAuth.isApiToken(agent) ||
      (await this.visitRegistrationAuth.hasReadRights(agent, {
        visitId,
        userId,
      }));

    if (!hasReadRights) {
      return null;
    }

    return this.dataSource.getRegistration(userId, visitId);
  }

  @Authorized()
  async getVisitByExperimentPk(
    agent: UserWithRole | null,
    experimentId: number
  ) {
    return this.dataSource.getVisitByExperimentPk(experimentId);
  }
}
