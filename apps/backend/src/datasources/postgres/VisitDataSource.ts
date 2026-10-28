import { GraphQLError } from 'graphql';

import { Visit } from '../../models/Visit';
import { VisitRegistration } from '../../models/VisitRegistration';
import { GetRegistrationsFilter } from '../../queries/VisitQueries';
import { CreateVisitArgs } from '../../resolvers/mutations/CreateVisitMutation';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../../resolvers/mutations/UpdateVisitRegistrationMutation';
import { VisitDataSource } from '../VisitDataSource';
import { VisitsFilter } from './../../resolvers/queries/VisitsQuery';
import database from './database';
import {
  createVisitRegistrationObject,
  createVisitObject,
  VisitRecord,
  VisitRegistrationRecord,
} from './records';

class PostgresVisitDataSource implements VisitDataSource {
  async getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    const visits: VisitRecord[] = await database('visits')
      .select('*')
      .modify((query) => {
        if (filter?.creatorId) {
          query.where('creator_id', filter.creatorId);
        }
        if (filter?.proposalPk) {
          query.where('proposal_pk', filter.proposalPk);
        }
        if (filter?.experimentPk) {
          query.where('experiment_pk', filter.experimentPk);
        }
      });

    return visits.map((visit) => createVisitObject(visit));
  }

  async getVisit(visitId: number): Promise<Visit | null> {
    const visit = await database('visits')
      .select('*')
      .where({ visit_id: visitId })
      .first();

    return visit ? createVisitObject(visit) : null;
  }

  async getRegistration(
    userId: number,
    visitId: number
  ): Promise<VisitRegistration | null> {
    const registration = await database('visits_has_users')
      .where({ visit_id: visitId })
      .andWhere({ user_id: userId })
      .first();

    return registration ? createVisitRegistrationObject(registration) : null;
  }

  async getRegistrations(
    filter: GetRegistrationsFilter
  ): Promise<VisitRegistration[]> {
    const registrations: VisitRegistrationRecord[] = await database(
      'visits_has_users'
    ).modify((query) => {
      if (filter.questionaryIds) {
        query.whereIn('registration_questionary_id', filter.questionaryIds);
      }
      if (filter.visitId) {
        query.where({ visit_id: filter.visitId });
      }
      query.orderBy('user_id');
    });

    return registrations.map((registration) =>
      createVisitRegistrationObject(registration)
    );
  }

  async getVisitByExperimentPk(experimentPk: number): Promise<Visit | null> {
    const visit = await database('visits')
      .select('*')
      .where({ experiment_pk: experimentPk })
      .first();

    return visit ? createVisitObject(visit) : null;
  }

  async createVisit(
    { experimentPk, teamLeadUserId }: CreateVisitArgs,
    creatorId: number,
    proposalPk: number
  ): Promise<Visit> {
    const visit = await database('visits')
      .insert({
        proposal_pk: proposalPk,
        creator_id: creatorId,
        experiment_pk: experimentPk,
        team_lead_user_id: teamLeadUserId,
      })
      .returning('*');

    return createVisitObject(visit[0]);
  }

  async updateVisit(args: UpdateVisitArgs): Promise<Visit> {
    await database.transaction(async (trx) => {
      if (args.team) {
        await database('visits_has_users')
          .delete()
          .where({ visit_id: args.visitId })
          .whereNotIn('user_id', args.team)
          .transacting(trx);

        await database('visits_has_users')
          .insert(
            args.team.map((userId) => ({
              visit_id: args.visitId,
              user_id: userId,
            }))
          )
          .onConflict(['user_id', 'visit_id'])
          .ignore()
          .transacting(trx);
      }
      if (args.teamLeadUserId) {
        await database('visits')
          .update({
            team_lead_user_id: args.teamLeadUserId,
          })
          .where({ visit_id: args.visitId })
          .transacting(trx);
      }
    });

    const updatedVisit = await this.getVisit(args.visitId);
    if (!updatedVisit) {
      throw new GraphQLError('Updated visit not found');
    }

    return updatedVisit;
  }

  async updateRegistration({
    userId,
    visitId,
    registrationQuestionaryId,
    startsAt,
    endsAt,
    status,
  }: UpdateVisitRegistrationArgs): Promise<VisitRegistration> {
    const result = await database('visits_has_users')
      .update({
        status: status,
        registration_questionary_id: registrationQuestionaryId,
        starts_at: startsAt,
        ends_at: endsAt,
      })
      .where({ visit_id: visitId })
      .andWhere({ user_id: userId })
      .returning('*');

    return createVisitRegistrationObject(result[0]);
  }

  async deleteVisit(visitId: number): Promise<Visit> {
    const result = await database('visits')
      .where({ visit_id: visitId })
      .delete()
      .returning('*');

    if (result.length !== 1) {
      throw new GraphQLError('Visit not found');
    }

    return createVisitObject(result[0]);
  }

  async isVisitorOfProposal(
    visitorId: number,
    proposalPk: number
  ): Promise<boolean> {
    const visitIdsOnProposal = database
      .select('visit_id')
      .from('visits')
      .where('proposal_pk', proposalPk);

    const results = await database
      .select('*')
      .from('visits_has_users')
      .whereIn('visit_id', visitIdsOnProposal)
      .andWhere('visits_has_users.user_id', visitorId);

    return results.length > 0;
  }

  async isVisitorOfVisit(visitorId: number, visitId: number): Promise<boolean> {
    const results = await database
      .select('*')
      .from('visits_has_users')
      .where('visits_has_users.visit_id', visitId)
      .andWhere('visits_has_users.user_id', visitorId);

    return results.length > 0;
  }

  // current user -> get related visits -> get related users for each of those visits
  async getRelatedUsersOnVisits(userId: number): Promise<number[]> {
    const proposalPksWhereUserIsPi = database
      .select('proposal_pk')
      .from('proposals')
      .where('proposer_id', userId);

    // Visits the user is related to: as creator, team lead or visitor, or as
    // the principal investigator of the visit's proposal.
    // Co-proposers are deliberately excluded -- they get no rights on a visit
    // (see VisitAuthorization) -- and the PI clause is what lets a PI resolve a
    // team lead or visitor who is not a member of their proposal, which
    // ProposalDataSource.getRelatedUsersOnProposals does not cover.
    const relatedVisitIds = database
      .select('v.visit_id')
      .from('visits as v')
      .leftJoin('visits_has_users as vhu', 'vhu.visit_id', 'v.visit_id')
      .where('v.creator_id', userId)
      .orWhere('v.team_lead_user_id', userId)
      .orWhere('vhu.user_id', userId)
      .orWhereIn('v.proposal_pk', proposalPksWhereUserIsPi);

    // Everyone participating in those visits: creators, team leads and visitors
    const relatedUsers: { user_id: number }[] = await database
      .select('creator_id as user_id')
      .from('visits')
      .whereIn('visit_id', relatedVisitIds)
      .union([
        database
          .select('team_lead_user_id as user_id')
          .from('visits')
          .whereIn('visit_id', relatedVisitIds),
        database
          .select('user_id')
          .from('visits_has_users')
          .whereIn('visit_id', relatedVisitIds),
      ]);

    return relatedUsers.map((r) => r.user_id);
  }
}

export default PostgresVisitDataSource;
