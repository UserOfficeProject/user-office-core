import { ExperimentSafetyInput } from '../../models/ExperimentSafetyInput';
import { Visit } from '../../models/Visit';
import { VisitRegistration } from '../../models/VisitRegistration';
import { GetRegistrationsFilter } from '../../queries/VisitQueries';
import { CreateVisitArgs } from '../../resolvers/mutations/CreateVisitMutation';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { UpdateVisitRegistrationArgs } from '../../resolvers/mutations/UpdateVisitRegistration';
import { VisitDataSource } from '../VisitDataSource';
import { VisitsFilter } from './../../resolvers/queries/VisitsQuery';
import database from './database';
import {
  createVisitRegistrationObject,
  createVisitObject,
  VisitRecord,
  VisitRegistrationRecord,
  createEsiObject,
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
        if (filter?.scheduledEventId) {
          query.where('scheduled_event_id', filter.scheduledEventId);
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

  getRegistration(userId: number, visitId: number): Promise<VisitRegistration> {
    return database('visits_has_users')
      .where({ visit_id: visitId })
      .andWhere({ user_id: userId })
      .first()
      .then((registration) => createVisitRegistrationObject(registration));
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
      })
      .then((registrations: VisitRegistrationRecord[]) =>
        registrations.map((registration) =>
          createVisitRegistrationObject(registration)
        )
      );
  }

  getVisitByScheduledEventId(eventId: number): Promise<Visit | null> {
    return database('visits')
      .select('*')
      .where({ scheduled_event_id: eventId })
      .first()
      .then((visit) => (visit ? createVisitObject(visit) : null));
  }

  getEsiByVisitId(visitId: number): Promise<ExperimentSafetyInput | null> {
    return database('experiment_safety_inputs')
      .select('*')
      .where({ visit_id: visitId })
      .first()
      .then((esi) => (esi ? createEsiObject(esi) : null));
  }

  createVisit(
    { scheduledEventId: scheduledEventId, teamLeadUserId }: CreateVisitArgs,
    creatorId: number,
    proposalPk: number
  ): Promise<Visit> {
    return database('visits')
      .insert({
        proposal_pk: proposalPk,
        creator_id: creatorId,
        scheduled_event_id: scheduledEventId,
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
        if (args.status || args.teamLeadUserId) {
          await database('visits')
            .update({
              status: args.status,
              team_lead_user_id: args.teamLeadUserId,
            })
            .where({ visit_id: args.visitId })
            .transacting(trx);
        }
      })
      .then(async () => {
        const updatedVisit = await this.getVisit(args.visitId);
        if (!updatedVisit) {
          throw new Error('Updated visit not found');
        }

        return updatedVisit;
      });
  }

  updateRegistration(
    userId: number,
    {
      visitId,
      trainingExpiryDate,
      isRegistrationSubmitted,
      registrationQuestionaryId,
      startsAt,
      endsAt,
    }: UpdateVisitRegistrationArgs
  ): Promise<VisitRegistration> {
    return database('visits_has_users')
      .update({
        training_expiry_date: trainingExpiryDate,
        is_registration_submitted: isRegistrationSubmitted,
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
          throw new Error('Visit not found');
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

  async getRelatedUsersOnVisits(id: number): Promise<number[]> {
    const relatedVisitors = await database
      .select('ou.user_id')
      .distinct()
      .from('visits as v')
      .leftJoin('visits_has_users as u', function () {
        this.on('u.visit_id', 'v.visit_id');
        this.andOn(function () {
          this.onVal('u.user_id', id); // where the user is part of the visit
          this.orOnVal('v.creator_id', id); // where the user is a creator of the visit
        });
      }) // this gives a list of proposals that a user is related to
      .join('visits_has_users as ou', { 'ou.visit_id': 'u.visit_id' }); // this gives us all of the associated coIs

    const relatedVisitCreators = await database
      .select('v.creator_id')
      .distinct()
      .from('visits as v')
      .leftJoin('visits_has_users as u', {
        'u.visit_id': 'v.visit_id',
        'u.user_id': id,
      }); // this gives a list of proposals that a user is related to

    const relatedUsers = [
      ...relatedVisitors.map((r) => r.user_id),
      ...relatedVisitCreators.map((r) => r.creator_id),
    ];

    return relatedUsers;
  }
}

export default PostgresVisitDataSource;
