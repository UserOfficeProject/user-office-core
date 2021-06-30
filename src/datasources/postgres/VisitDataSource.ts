import { BasicUserDetails } from '../../models/User';
import { Visit } from '../../models/Visit';
import { UpdateVisitArgs } from '../../resolvers/mutations/UpdateVisitMutation';
import { VisitDataSource } from '../VisitDataSource';
import { VisitsFilter } from './../../resolvers/queries/VisitsQuery';
import database from './database';
import {
  createBasicUserObject,
  createVisitObject,
  VisitRecord,
} from './records';

class PostgresVisitDataSource implements VisitDataSource {
  getTeam(visitId: number): Promise<BasicUserDetails[]> {
    return database('visits_has_users')
      .select('users.*')
      .where({ visit_id: visitId })
      .leftJoin('users', 'users.user_id', 'visits_has_users.user_id')
      .then((users) => users.map((user) => createBasicUserObject(user)));
  }
  getVisits(filter?: VisitsFilter): Promise<Visit[]> {
    return database('visits')
      .select('*')
      .modify((query) => {
        if (filter?.visitorId) {
          query.where('visitor_id', filter.visitorId);
        }
        if (filter?.questionaryId) {
          query.where('questionary_id', filter.questionaryId);
        }
        if (filter?.proposalPk) {
          query.where('proposal_pk', filter.proposalPk);
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

  createVisit(
    proposalPk: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visit> {
    return database('visits')
      .insert({
        proposal_pk: proposalPk,
        visitor_id: visitorId,
        questionary_id: questionaryId,
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
            .transacting(trx);

          await database('visits_has_users')
            .insert(
              args.team.map((userId) => ({
                visit_id: args.visitId,
                user_id: userId,
              }))
            )
            .transacting(trx);
        }

        if (args.status || args.proposalPk) {
          await database('visits')
            .update({
              status: args.status,
              proposal_pk: args.proposalPk,
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

  deleteVisit(visitId: number): Promise<Visit> {
    return database('visits')
      .where({ visit_id: visitId })
      .delete()
      .returning('*')
      .then((result) => {
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
}

export default PostgresVisitDataSource;
