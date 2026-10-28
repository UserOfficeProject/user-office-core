import { container, inject, injectable } from 'tsyringe';

import { ProposalAuthorization } from '../auth/ProposalAuthorization';
import { UserAuthorization } from '../auth/UserAuthorization';
import { VisitAuthorization } from '../auth/VisitAuthorization';
import { VisitRegistrationAuthorization } from '../auth/VisitRegistrationAuthorization';
import { Tokens } from '../config/Tokens';
import { ExperimentDataSource } from '../datasources/ExperimentDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { Authorized } from '../decorators';
import { Roles } from '../models/Role';
import { UserWithRole } from '../models/User';
import { VisitRegistration } from '../models/VisitRegistration';
import { VisitsFilter } from '../resolvers/queries/VisitsQuery';
import { VisitPerms } from '../resolvers/types/VisitPerms';
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
    @inject(Tokens.UserAuthorization)
    private userAuth: UserAuthorization,
    @inject(Tokens.ProposalAuthorization)
    private proposalAuth: ProposalAuthorization,
    @inject(Tokens.ExperimentDataSource)
    private experimentDataSource: ExperimentDataSource
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

  @Authorized()
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
    experimentPk: number
  ) {
    // No rights check here since this is only called by when constructing the parent experiment object
    // Rights checks is performed there in a middleware fn
    const visit = await this.dataSource.getVisitByExperimentPk(experimentPk);

    return visit;
  }

  async getVisitPermsByExperimentPk(
    agent: UserWithRole | null,
    experimentPk: number
  ): Promise<VisitPerms> {
    let readable = false;
    let writeable = false;
    let createable = false;

    const visit = await this.dataSource.getVisitByExperimentPk(experimentPk);
    const experiment =
      await this.experimentDataSource.getExperiment(experimentPk);

    if (experiment) {
      createable = await this.visitAuth.hasCreateRights(
        agent,
        experiment!.proposalPk
      );
    }

    if (visit) {
      [readable, writeable] = await Promise.all([
        this.visitAuth.hasReadRights(agent, visit),
        this.visitAuth.hasWriteRights(agent, visit),
      ]);
    }

    return { readable, writeable, createable };
  }
}
