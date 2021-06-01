import { inject, injectable } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ProposalDataSource } from '../datasources/ProposalDataSource';
import { rejection } from '../models/Rejection';
import { TemplateCategoryId } from '../models/Template';
import { CreateVisitationArgs } from '../resolvers/mutations/CreateVisitationMutation';
import { UpdateVisitationArgs } from '../resolvers/mutations/UpdateVisitationMutation';
import { QuestionaryDataSource } from './../datasources/QuestionaryDataSource';
import { TemplateDataSource } from './../datasources/TemplateDataSource';
import { VisitationDataSource } from './../datasources/VisitationDataSource';
import { Rejection } from './../models/Rejection';
import { UserWithRole } from './../models/User';
import { Visitation, VisitationStatus } from './../models/Visitation';
import { UserAuthorization } from './../utils/UserAuthorization';
import { VisitationAuthorization } from './../utils/VisitationAuthorization';

@injectable()
export default class VisitationMutations {
  constructor(
    @inject(Tokens.VisitationDataSource)
    private dataSource: VisitationDataSource,
    @inject(Tokens.ProposalDataSource)
    private proposalDataSource: ProposalDataSource,
    @inject(Tokens.QuestionaryDataSource)
    private questionaryDataSource: QuestionaryDataSource,
    @inject(Tokens.TemplateDataSource)
    private templateDataSource: TemplateDataSource,
    @inject(Tokens.VisitationAuthorization)
    private visitationAuthorization: VisitationAuthorization,
    @inject(Tokens.UserAuthorization)
    private userAuthorization: UserAuthorization
  ) {}

  async createVisitation(
    user: UserWithRole | null,
    args: CreateVisitationArgs
  ): Promise<Visitation | Rejection> {
    const proposal = await this.proposalDataSource.get(args.proposalId);
    if (!proposal) {
      return rejection('Can not create visitation, proposal does not exist', {
        args,
        agent: user,
      });
    }

    const isProposalOwner = await this.userAuthorization.hasAccessRights(
      user,
      proposal
    );
    if (isProposalOwner === false) {
      return rejection(
        'Can not create visitation for proposal that does not belong to you',
        { args, agent: user }
      );
    }

    const activeTemplate = await this.templateDataSource.getActiveTemplateId(
      TemplateCategoryId.VISITATION
    );
    if (!activeTemplate) {
      return rejection(
        'Could not create visitation because system has no active visitation template',
        { args, agent: user }
      );
    }

    try {
      const questionary = await this.questionaryDataSource.create(
        user!.id,
        activeTemplate
      );

      const visitation = await this.dataSource.createVisitation(
        args.proposalId,
        user!.id,
        questionary.questionaryId
      );

      if (args.team && args.team.length > 0) {
        await this.dataSource.updateVisitation({
          visitationId: visitation.id,
          team: args.team,
        });
      }

      return visitation;
    } catch (error) {
      return rejection(
        'Could not create visitation because of an error',
        { args },
        error
      );
    }
  }

  async updateVisitation(
    user: UserWithRole | null,
    args: UpdateVisitationArgs
  ): Promise<Visitation | Rejection> {
    const hasRights = await this.visitationAuthorization.hasWriteRights(
      user,
      args.visitationId
    );

    if (hasRights === false) {
      return rejection(
        'Can not update visitation because of insufficient permissions',
        { args, agent: user }
      );
    }

    if (
      args.status === VisitationStatus.ACCEPTED &&
      !this.userAuthorization.isUserOfficer(user)
    ) {
      return rejection(
        'Can not update proposal status because of insufficient permissions'
      );
    }

    return this.dataSource.updateVisitation(args);
  }

  async deleteVisitation(
    user: UserWithRole | null,
    visitationId: number
  ): Promise<Visitation | Rejection> {
    const hasRights = await this.visitationAuthorization.hasWriteRights(
      user,
      visitationId
    );
    if (hasRights === false) {
      return rejection(
        'Can not update visitation because of insufficient permissions',
        { user, visitationId }
      );
    }

    return this.dataSource.deleteVisitation(visitationId);
  }
}
