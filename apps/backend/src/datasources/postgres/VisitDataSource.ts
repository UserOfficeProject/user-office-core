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
  getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    return database('visits')
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
      })
      .then((visits: VisitRecord[]) =>
        visits.map((visit) => createVisitObject(visit))
      );
  }

  getVisit(visitId: number): Promise<Visit | null> {
    return database('visits')
      .select('*')
      .where({ visit_id: visitId })
      .first()
      .then((visit) => (visit ? createVisitObject(visit) : null));
  }

  getRegistration(
    userId: number,
    visitId: number
  ): Promise<VisitRegistration | null> {
    return database('visits_has_users')
      .where({ visit_id: visitId })
      .andWhere({ user_id: userId })
      .first()
      .then((registration) =>
        registration ? createVisitRegistrationObject(registration) : null
      );
  }

  getRegistrations(
    filter: GetRegistrationsFilter
  ): Promise<VisitRegistration[]> {
    return database('visits_has_users')
      .modify((query) => {
        if (filter.questionaryIds) {
          query.whereIn('registration_questionary_id', filter.questionaryIds);
        }
        if (filter.visitId) {
          query.where({ visit_id: filter.visitId });
        }
        query.orderBy('user_id');
      })
      .then((registrations: VisitRegistrationRecord[]) =>
        registrations.map((registration) =>
          createVisitRegistrationObject(registration)
        )
      );
  }

  getVisitByExperimentPk(experimentPk: number): Promise<Visit | null> {
    return database('visits')
      .select('*')
      .where({ experiment_pk: experimentPk })
      .first()
      .then((visit) => (visit ? createVisitObject(visit) : null));
  }

  createVisit(
    { experimentPk, teamLeadUserId }: CreateVisitArgs,
    creatorId: number,
    proposalPk: number
  ): Promise<Visit> {
    return database('visits')
      .insert({
        proposal_pk: proposalPk,
        creator_id: creatorId,
        experiment_pk: experimentPk,
        team_lead_user_id: teamLeadUserId,
      })
      .returning('*')
      .then((visit) => createVisitObject(visit[0]));
  }

  updateVisit(args: UpdateVisitArgs): Promise<Visit> {
    return database
      .transaction(async (trx) => {
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
      })
      .then(async () => {
        const updatedVisit = await this.getVisit(args.visitId);
        if (!updatedVisit) {
          throw new GraphQLError('Updated visit not found');
        }

        return updatedVisit;
      });
  }

  updateRegistration({
    userId,
    visitId,
    registrationQuestionaryId,
    startsAt,
    endsAt,
    status,
  }: UpdateVisitRegistrationArgs): Promise<VisitRegistration> {
    return database('visits_has_users')
      .update({
        status: status,
        registration_questionary_id: registrationQuestionaryId,
        starts_at: startsAt,
        ends_at: endsAt,
      })
      .where({ visit_id: visitId })
      .andWhere({ user_id: userId })
      .returning('*')
      .then((result) => createVisitRegistrationObject(result[0]));
  }

  deleteVisit(visitId: number): Promise<Visit> {
    return database('visits')
      .where({ visit_id: visitId })
      .delete()
      .returning('*')
      .then((result) => {
        if (result.length !== 1) {
          throw new GraphQLError('Visit not found');
        }

        return createVisitObject(result[0]);
      });
  }

  isVisitorOfProposal(visitorId: number, proposalPk: number): Promise<boolean> {
    return database
      .select('*')
      .from('visits_has_users')
      .whereIn('visit_id', function () {
        this.select('visit_id').from('visits').where('proposal_pk', proposalPk);
      })
      .andWhere('visits_has_users.user_id', visitorId)
      .then((results) => results.length > 0);
  }

  isVisitorOfVisit(visitorId: number, visitId: number): Promise<boolean> {
    return database
      .select('*')
      .from('visits_has_users')
      .where('visits_has_users.visit_id', visitId)
      .andWhere('visits_has_users.user_id', visitorId)
      .then((results) => results.length > 0);
  }

  // current user -> get related visits -> get related users for each of those visits
  async getRelatedUsersOnVisits(id: number): Promise<number[]> {
    // Visits the user is related to: as creator, team lead, visitor,
    // or as a member (PI or co-proposer) of the visit's proposal
    const relatedVisitIds = database
      .select('v.visit_id')
      .from('visits as v')
      .leftJoin('visits_has_users as vhu', 'vhu.visit_id', 'v.visit_id')
      .where('v.creator_id', id)
      .orWhere('v.team_lead_user_id', id)
      .orWhere('vhu.user_id', id)
      .orWhereIn('v.proposal_pk', function () {
        this.select('proposal_pk').from('proposals').where('proposer_id', id);
      });

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
