import { BasicUserDetails } from '../../models/User';
import { Visitation } from '../../models/Visitation';
import { UpdateVisitationArgs } from '../../resolvers/mutations/UpdateVisitationMutation';
import { VisitationDataSource } from '../VisitationDataSource';
import { VisitationsFilter } from './../../resolvers/queries/VisitationsQuery';
import database from './database';
import {
  createBasicUserObject,
  createVisitationObject,
  VisitationRecord,
} from './records';

class PostgresVisitationDataSource implements VisitationDataSource {
  getTeam(visitationId: number): Promise<BasicUserDetails[]> {
    return database('visitations_has_users')
      .select('users.*')
      .where({ visitation_id: visitationId })
      .leftJoin('users', 'users.user_id', 'visitations_has_users.user_id')
      .then((users) => users.map((user) => createBasicUserObject(user)));
  }
  getVisitations(filter?: VisitationsFilter): Promise<Visitation[]> {
    return database('visitations')
      .select('*')
      .modify((query) => {
        if (filter?.visitorId) {
          query.where('visitor_id', filter.visitorId);
        }
        if (filter?.questionaryId) {
          query.where('questionary_id', filter.questionaryId);
        }
      })
      .then((visitations: VisitationRecord[]) =>
        visitations.map((visitation) => createVisitationObject(visitation))
      );
  }
  getVisitation(visitationId: number): Promise<Visitation | null> {
    return database('visitations')
      .select('*')
      .where({ visitation_id: visitationId })
      .first()
      .then((visitation) =>
        visitation ? createVisitationObject(visitation) : null
      );
  }

  createVisitation(
    proposalId: number,
    visitorId: number,
    questionaryId: number
  ): Promise<Visitation> {
    return database('visitations')
      .insert({
        proposal_id: proposalId,
        visitor_id: visitorId,
        questionary_id: questionaryId,
      })
      .returning('*')
      .then((visitation) => createVisitationObject(visitation[0]));
  }

  updateVisitation(args: UpdateVisitationArgs): Promise<Visitation> {
    return database
      .transaction(async (trx) => {
        if (args.team) {
          await database('visitations_has_users')
            .delete()
            .where({ visitation_id: args.visitationId })
            .transacting(trx);

          await database('visitations_has_users')
            .insert(
              args.team.map((userId) => ({
                visitation_id: args.visitationId,
                user_id: userId,
              }))
            )
            .transacting(trx);
        }

        if (args.status || args.proposalId) {
          await database('visitations')
            .update({
              status: args.status,
              proposal_id: args.proposalId,
            })
            .where({ visitation_id: args.visitationId })
            .transacting(trx);
        }
      })
      .then(async () => {
        const updatedVisitation = await this.getVisitation(args.visitationId);
        if (!updatedVisitation) {
          throw new Error('Updated visitation not found');
        }

        return updatedVisitation;
      });
  }

  deleteVisitation(visitationId: number): Promise<Visitation> {
    return database('visitations')
      .where({ visitation_id: visitationId })
      .delete()
      .returning('*')
      .then((result) => {
        return createVisitationObject(result[0]);
      });
  }
}

export default PostgresVisitationDataSource;
