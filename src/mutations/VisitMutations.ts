import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { QuestionaryDataSource } from '../datasources/QuestionaryDataSource';
import { TemplateDataSource } from '../datasources/TemplateDataSource';
import { VisitDataSource } from '../datasources/VisitDataSource';
import { ProposalEndStatus } from '../models/Proposal';
import { rejection } from '../models/Rejection';
import { Rejection } from '../models/Rejection';
import { TemplateCategoryId } from '../models/Template';
import { UserWithRole } from '../models/User';
import { Visit, VisitStatus } from '../models/Visit';
import { CreateVisitArgs } from '../resolvers/mutations/CreateVisitMutation';
import { UpdateVisitArgs } from '../resolvers/mutations/UpdateVisitMutation';
import { UserAuthorization } from '../utils/UserAuthorization';
import { VisitAuthorization } from './../utils/VisitAuthorization';

@injectable()
export default class VisitMutations {
  constructor(
    @inject(Tokens.VisitDataSource)
    private dataSource: VisitDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.VisitAuthorization)
    private visitAuthorization: VisitAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  async createVisit(
    user: UserWithRole | null,
    args: CreateVisitArgs
  ): Promise<Visit | Rejection> {
    const proposal = await this.proposalDataSource.get(args.proposalPk);
    if (!proposal) {
      return rejection('Can not create visit, proposal does not exist', {
        args,
        agent: user,
      });
    }

    if (
      proposal.finalStatus !== ProposalEndStatus.ACCEPTED ||
      proposal.managementDecisionSubmitted === false
    ) {
      return rejection(
        'Can not create visit, the proposal is not yet accepted',
        {
          args,
          agent: user,
        }
      );
    }

    const isProposalOwner = await this.userAuthorization.hasAccessRights(
      user,
      proposal
    );
    if (isProposalOwner === false) {
      return rejection(
        'Can not create visit for proposal that does not belong to you',
        { args, agent: user }
      );
    }

    const activeTemplate = await this.templateDataSource.getActiveTemplateId(
      TemplateCategoryId.VISIT
    );
    if (!activeTemplate) {
      return rejection(
        'Could not create visit because system has no active visit template',
        { args, agent: user }
      );
    }

    try {
      const questionary = await this.questionaryDataSource.create(
        user!.id,
        activeTemplate
      );

      const visit = await this.dataSource.createVisit(
        args.proposalPk,
        user!.id,
        questionary.questionaryId
      );

      if (args.team && args.team.length > 0) {
        await this.dataSource.updateVisit({
          visitId: visit.id,
          team: args.team,
        });
      }

      return visit;
    } catch (error) {
      return rejection(
        'Could not create visit because of an error',
        { args },
        error
      );
    }
  }

  async updateVisit(
    user: UserWithRole | null,
    args: UpdateVisitArgs
  ): Promise<Visit | Rejection> {
    const hasRights = await this.visitAuthorization.hasWriteRights(
      user,
      args.visitId
    );

    if (hasRights === false) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { args, agent: user }
      );
    }

    if (
      args.status === VisitStatus.ACCEPTED &&
      !this.userAuthorization.isUserOfficer(user)
    ) {
      return rejection(
        'Can not update proposal status because of insufficient permissions'
      );
    }

    return this.dataSource.updateVisit(args);
  }

  async deleteVisit(
    user: UserWithRole | null,
    visitId: number
  ): Promise<Visit | Rejection> {
    const hasRights = await this.visitAuthorization.hasWriteRights(
      user,
      visitId
    );
    if (hasRights === false) {
      return rejection(
        'Can not update visit because of insufficient permissions',
        { user, visitId }
      );
    }

    return this.dataSource.deleteVisit(visitId);
  }
}
