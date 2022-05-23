import { logger } from '@user-office-software/duo-logger';
import BluePromise from 'bluebird';
import { Knex } from 'knex';
import { injectable } from 'tsyringe';

import { Event } from '../../events/event.enum';
import { Proposal, ProposalPksWithNextStatus } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { getQuestionDefinition } from '../../models/questionTypes/QuestionRegistry';
import { ReviewerFilter } from '../../models/Review';
import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { TechnicalReview } from '../../models/TechnicalReview';
import { UpdateTechnicalReviewAssigneeInput } from '../../resolvers/mutations/UpdateTechnicalReviewAssignee';
import {
  ProposalBookingFilter,
  ProposalBookingScheduledEventFilterCore,
} from '../../resolvers/types/ProposalBooking';
import { UserProposalsFilter } from '../../resolvers/types/User';
import { ProposalDataSource } from '../ProposalDataSource';
import {
  ProposalsFilter,
  QuestionFilterInput,
} from './../../resolvers/queries/ProposalsQuery';
import database from './database';
import {
  CallRecord,
  createProposalObject,
  createProposalViewObject,
  createScheduledEventObject,
  createTechnicalReviewObject,
  ProposalEventsRecord,
  ProposalRecord,
  ProposalViewRecord,
  ScheduledEventRecord,
  StatusChangingEventRecord,
  TechnicalReviewRecord,
} from './records';

const fieldMap: { [key: string]: string } = {
  finalStatus: 'final_status',
  technicalStatus: 'technical_review_status',
  sepCode: 'sep_code',
  rankOrder: 'rank_order',
  reviewAverage: 'average',
  reviewDeviation: 'deviation',
  callShortCode: 'proposal_table_view.call_short_code',
  instrumentName: 'instrument_name',
  statusName: 'proposal_table_view.proposal_status_id',
  proposalId: 'proposal_table_view.proposal_id',
  title: 'title',
};

export async function calculateReferenceNumber(
  format: string,
  sequence: number | null
): Promise<string> {
  const prefix: string = format.slice(0, format.indexOf('{'));
  const formatParameters: { [param: string]: string } = {};
  format.match(/(\w+:\w+)/g)?.forEach((el: string) => {
    const [k, v] = el.split(':');
    formatParameters[k] = v;
  });

  if (!prefix || !('digits' in formatParameters)) {
    return Promise.reject(
      new Error(`The reference number format ('${format}') is invalid`)
    );
  }

  sequence = sequence ?? 0;
  if (String(sequence).length > Number(formatParameters['digits'])) {
    return Promise.reject(
      new Error(
        `The sequence number provided ('${formatParameters['digits']}') exceeds the format's digits parameter`
      )
    );
  }
  const paddedSequence: string = String(sequence).padStart(
    Number(formatParameters['digits']),
    '0'
  );

  return prefix + paddedSequence;
}

@injectable()
export default class PostgresProposalDataSource implements ProposalDataSource {
  async updateProposalTechnicalReviewer({
    userId,
    proposalPks,
  }: UpdateTechnicalReviewAssigneeInput): Promise<TechnicalReview[]> {
    const response = await database('technical_review')
      .update('technical_review_assignee_id', userId)
      .whereIn('proposal_pk', proposalPks)
      .returning('*')
      .then((technicalReviews: TechnicalReviewRecord[]) => {
        return technicalReviews.map((technicalReview) =>
          createTechnicalReviewObject(technicalReview)
        );
      });

    return response;
  }

  async submitProposal(
    primaryKey: number,
    referenceNumber?: string
  ): Promise<Proposal> {
    const proposal: ProposalRecord[] | undefined = await database.transaction(
      async (trx) => {
        try {
          const call = await database
            .select(
              'c.call_id',
              'c.reference_number_format',
              'c.proposal_sequence'
            )
            .from('call as c')
            .join('proposals as p', { 'p.call_id': 'c.call_id' })
            .where('p.proposal_pk', primaryKey)
            .first()
            .forUpdate()
            .transacting(trx);

          let ref: string | null;

          if (referenceNumber !== undefined) {
            ref = referenceNumber;
          } else if (call.reference_number_format) {
            ref = await calculateReferenceNumber(
              call.reference_number_format,
              call.proposal_sequence
            );

            if (!ref) {
              throw new Error(
                `Failed to calculate reference number for proposal with id '${primaryKey}' using format '${call.reference_number_format}'`
              );
            } else if (ref.length > 16) {
              throw new Error(
                `The reference number calculated is too long ('${ref.length} characters)`
              );
            }
          }

          await database
            .update({
              proposal_sequence: (call.proposal_sequence ?? 0) + 1,
            })
            .from('call as c')
            .where('c.call_id', call.call_id)
            .transacting(trx);

          const proposalUpdate = await database
            .from('proposals')
            .returning('*')
            .where('proposal_pk', primaryKey)
            .modify((query) => {
              if (ref) {
                query.update({
                  proposal_id: ref,
                  reference_number_sequence: call.proposal_sequence ?? 0,
                  submitted: true,
                });
              } else {
                query.update({
                  reference_number_sequence: call.proposal_sequence ?? 0,
                  submitted: true,
                });
              }
            })
            .transacting(trx);

          return await trx.commit(proposalUpdate);
        } catch (error) {
          logger.logException(
            `Failed to submit proposal with id '${primaryKey}'`,
            error
          );
        }
      }
    );

    if (proposal?.length !== 1) {
      throw new Error(`Failed to submit proposal with id '${primaryKey}'`);
    }

    return createProposalObject(proposal[0]);
  }

  async deleteProposal(id: number): Promise<Proposal> {
    return database('proposals')
      .where('proposals.proposal_pk', id)
      .del()
      .from('proposals')
      .returning('*')
      .then((proposal: ProposalRecord[]) => {
        if (proposal === undefined || proposal.length !== 1) {
          throw new Error(`Could not delete proposal with id:${id}`);
        }

        return createProposalObject(proposal[0]);
      });
  }

  async setProposalUsers(proposalPk: number, users: number[]): Promise<void> {
    return database.transaction(async (trx) => {
      return database
        .from('proposal_user')
        .where('proposal_pk', proposalPk)
        .del()
        .transacting(trx)
        .then(() => {
          return BluePromise.map(users, (user_id: number) => {
            return database
              .insert({ proposal_pk: proposalPk, user_id: user_id })
              .into('proposal_user')
              .transacting(trx);
          });
        })
        .then(() => {
          trx.commit;
        })
        .catch((error) => {
          trx.rollback;
          throw error; // re-throw
        });
    });
  }

  async update(proposal: Proposal): Promise<Proposal> {
    return database
      .update(
        {
          title: proposal.title,
          abstract: proposal.abstract,
          proposer_id: proposal.proposerId,
          status_id: proposal.statusId,
          created_at: proposal.created,
          updated_at: proposal.updated,
          proposal_id: proposal.proposalId,
          final_status: proposal.finalStatus,
          call_id: proposal.callId,
          questionary_id: proposal.questionaryId,
          comment_for_user: proposal.commentForUser,
          comment_for_management: proposal.commentForManagement,
          notified: proposal.notified,
          submitted: proposal.submitted,
          management_time_allocation: proposal.managementTimeAllocation,
          management_decision_submitted: proposal.managementDecisionSubmitted,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_pk', proposal.primaryKey)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal not found ${proposal.primaryKey}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async updateProposalStatus(
    proposalPk: number,
    proposalStatusId: number
  ): Promise<Proposal> {
    return database
      .update(
        {
          status_id: proposalStatusId,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_pk', proposalPk)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new Error(`Proposal not found ${proposalPk}`);
        }

        return createProposalObject(records[0]);
      });
  }

  async get(id: number): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('proposal_pk', id)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async create(
    proposer_id: number,
    call_id: number,
    questionary_id: number
  ): Promise<Proposal> {
    return database
      .insert({ proposer_id, call_id, questionary_id, status_id: 1 }, ['*'])
      .from('proposals')
      .then((resultSet: ProposalRecord[]) => {
        return createProposalObject(resultSet[0]);
      });
  }

  addQuestionFilter(
    query: Knex.QueryBuilder,
    questionFilter: QuestionFilterInput
  ) {
    const questionFilterQuery = getQuestionDefinition(
      questionFilter.dataType
    ).filterQuery;

    if (!questionFilterQuery) {
      throw new Error(
        `Filter query not implemented for ${questionFilter.dataType}`
      );
    }

    query
      .leftJoin(
        'answers',
        'answers.questionary_id',
        'proposal_table_view.questionary_id'
      )
      .andWhere('answers.question_id', questionFilter.questionId)
      .modify(questionFilterQuery, questionFilter);

    return query;
  }

  async getProposalsFromView(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .modify((query) => {
        if (filter?.callId) {
          query.where('proposal_table_view.call_id', filter?.callId);
        }
        if (filter?.instrumentId) {
          query.where(
            'proposal_table_view.proposal_instrument_id',
            filter?.instrumentId
          );
        }

        if (filter?.proposalStatusId) {
          query.where(
            'proposal_table_view.proposal_status_id',
            filter?.proposalStatusId
          );
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_table_view.proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }
        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }
        if (
          searchText !== '' &&
          searchText !== null &&
          searchText !== undefined
        ) {
          searchText = `%${searchText}%`;

          query
            .whereRaw('proposal_table_view.proposal_id ILIKE ?', searchText)
            .orWhereRaw('proposal_table_view.title ILIKE ?', searchText)
            .orWhereRaw('proposal_status_name ILIKE ?', searchText)
            .orWhereRaw('instrument_name ILIKE ?', searchText);
        }

        if (sortField && sortDirection) {
          if (!fieldMap.hasOwnProperty(sortField)) {
            throw new Error(`Bad sort field given: ${sortField}`);
          }
          sortField = fieldMap[sortField];
          query.orderBy(sortField, sortDirection);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposalViews: props,
        };
      });
  }

  async getProposals(
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: Proposal[] }> {
    return database
      .select(['proposals.*', database.raw('count(*) OVER() AS full_count')])
      .from('proposals')
      .orderBy('proposals.proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }

        if (filter?.questionaryIds) {
          query.whereIn('proposals.questionary_id', filter.questionaryIds);
        }
        if (filter?.callId) {
          query.where('proposals.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_pk',
              'proposals.proposal_pk'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentId
            );
        }

        if (filter?.proposalStatusId) {
          query.where('proposals.status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposals.proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }
        if (filter?.referenceNumbers) {
          query.whereIn('proposals.proposal_id', filter.referenceNumbers);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getInstrumentScientistProposals(
    scientistId: number,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return database
      .select([
        'proposal_table_view.*',
        database.raw('count(*) OVER() AS full_count'),
      ])
      .from('proposal_table_view')
      .join('instruments', {
        'instruments.instrument_id':
          'proposal_table_view.proposal_instrument_id',
      })
      .leftJoin('instrument_has_scientists', {
        'instrument_has_scientists.instrument_id':
          'proposal_table_view.proposal_instrument_id',
      })
      .where(function () {
        this.where('instrument_has_scientists.user_id', scientistId).orWhere(
          'instruments.manager_user_id',
          scientistId
        );
      })
      .distinct('proposal_table_view.proposal_pk')
      .orderBy('proposal_table_view.proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query
            .where('title', 'ilike', `%${filter.text}%`)
            .orWhere('abstract', 'ilike', `%${filter.text}%`);
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          query.where(
            'proposal_table_view.technical_review_assignee_id',
            scientistId
          );
        }
        if (filter?.callId) {
          query.where('proposal_table_view.call_id', filter.callId);
        }
        if (filter?.instrumentId) {
          query.where('instruments.instrument_id', filter.instrumentId);
        }

        if (filter?.proposalStatusId) {
          query.where(
            'proposal_table_view.proposal_status_id',
            filter?.proposalStatusId
          );
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_table_view.proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }

        if (first) {
          query.limit(first);
        }
        if (offset) {
          query.offset(offset);
        }
      })
      .then((proposals: ProposalViewRecord[]) => {
        const props = proposals.map((proposal) =>
          createProposalViewObject(proposal)
        );

        return {
          totalCount: proposals[0] ? proposals[0].full_count : 0,
          proposals: props,
        };
      });
  }

  async getUserProposals(
    id: number,
    filter?: UserProposalsFilter
  ): Promise<Proposal[]> {
    return database
      .select('p.*')
      .from('proposals as p')
      .where('p.proposer_id', id) // Principal investigator
      .orWhereIn('proposal_pk', function () {
        // co-proposer
        this.select('proposal_pk').from('proposal_user').where('user_id', id);
      })
      .orWhereIn('proposal_pk', function () {
        // visitor
        this.select('proposal_pk')
          .from('visits')
          .leftJoin(
            'visits_has_users',
            'visits.visit_id',
            'visits_has_users.visit_id'
          )
          .where('visits_has_users.user_id', id);
      })
      .modify((qb) => {
        if (filter?.instrumentId) {
          qb.innerJoin('instrument_has_proposals as ihp', {
            'p.proposal_pk': 'ihp.proposal_pk',
          });
          qb.where('ihp.instrument_id', filter.instrumentId);
        }

        if (filter?.managementDecisionSubmitted) {
          qb.where(
            'p.management_decision_submitted',
            filter.managementDecisionSubmitted
          );
        }

        if (filter?.finalStatus) {
          qb.where('p.final_status', filter.finalStatus);
        }
      })
      .groupBy('p.proposal_pk')
      .then((proposals: ProposalRecord[]) =>
        proposals.map((proposal) => createProposalObject(proposal))
      );
  }

  async markEventAsDoneOnProposal(
    event: Event,
    proposalPk: number
  ): Promise<ProposalEventsRecord | null> {
    const dataToInsert = {
      proposal_pk: proposalPk,
      [event.toLowerCase()]: true,
    };

    const result = await database.raw(
      `? ON CONFLICT (proposal_pk)
        DO UPDATE SET
        ${event.toLowerCase()} = true
        RETURNING *;`,
      [database('proposal_events').insert(dataToInsert)]
    );

    if (result.rows && result.rows.length) {
      return result.rows[0];
    } else {
      return null;
    }
  }

  async getCount(callId: number): Promise<number> {
    return database('proposals')
      .count('call_id')
      .where('call_id', callId)
      .first()
      .then((result: { count?: string | undefined } | undefined) => {
        return parseInt(result?.count || '0');
      });
  }

  async cloneProposal(sourceProposal: Proposal): Promise<Proposal> {
    const [newProposal]: ProposalRecord[] = (
      await database.raw(`
          INSERT INTO proposals
          (title,
           abstract,
           status_id,
           proposer_id,
           created_at,
           updated_at,
           final_status,
           call_id,
           questionary_id,
           comment_for_management,
           comment_for_user,
           notified,
           submitted,
           management_decision_submitted,
           management_time_allocation)
          SELECT title,
                 abstract,
                 status_id,
                 proposer_id,
                 created_at,
                 updated_at,
                 final_status,
                 call_id,
                 questionary_id,
                 comment_for_management,
                 comment_for_user,
                 notified,
                 submitted,
                 management_decision_submitted,
                 management_time_allocation
          FROM proposals
          WHERE proposal_pk = ${sourceProposal.primaryKey} RETURNING *
      `)
    ).rows;

    return createProposalObject(newProposal);
  }

  async resetProposalEvents(
    proposalPk: number,
    callId: number,
    statusId: number
  ): Promise<boolean> {
    const proposalCall: CallRecord = await database('call')
      .select('*')
      .where('call_id', callId)
      .first();

    if (!proposalCall) {
      logger.logError(
        'Could not reset proposal events because proposal call does not exist',
        { callId }
      );

      throw new Error('Could not reset proposal events');
    }

    const proposalEventsToReset: StatusChangingEventRecord[] = (
      await database.raw(`
          SELECT *
          FROM proposal_workflow_connections AS pwc
                   JOIN
               status_changing_events
               ON
                       status_changing_events.proposal_workflow_connection_id = pwc.proposal_workflow_connection_id
          WHERE pwc.proposal_workflow_connection_id >= (
              SELECT proposal_workflow_connection_id
              FROM proposal_workflow_connections
              WHERE proposal_workflow_id = ${proposalCall.proposal_workflow_id}
                AND proposal_status_id = ${statusId}
          )
            AND pwc.proposal_workflow_id = ${proposalCall.proposal_workflow_id};
      `)
    ).rows;

    if (proposalEventsToReset?.length) {
      const dataToUpdate = proposalEventsToReset
        .map(
          (event) =>
            `${event.status_changing_event.toLocaleLowerCase()} = false`
        )
        .join(', ');

      const [updatedProposalEvents]: ProposalEventsRecord[] = (
        await database.raw(`
            UPDATE proposal_events
            SET ${dataToUpdate}
            WHERE proposal_pk = ${proposalPk} RETURNING *
        `)
      ).rows;

      if (!updatedProposalEvents) {
        logger.logError('Could not reset proposal events', { dataToUpdate });

        throw new Error('Could not reset proposal events');
      }
    }

    return true;
  }

  async changeProposalsStatus(
    statusId: number,
    proposalPks: number[]
  ): Promise<ProposalPksWithNextStatus> {
    const dataToUpdate: { status_id: number; submitted?: boolean } = {
      status_id: statusId,
    };

    // NOTE: If status is DRAFT re-open the proposal for submission
    if (statusId === 1) {
      dataToUpdate.submitted = false;
    }

    const result: ProposalRecord[] = await database
      .update(dataToUpdate, ['*'])
      .from('proposals')
      .whereIn('proposal_pk', proposalPks);

    if (result?.length === 0) {
      logger.logError('Could not change proposals status', { dataToUpdate });

      throw new Error('Could not change proposals status');
    }

    return new ProposalPksWithNextStatus(
      result.map((item) => item.proposal_pk)
    );
  }

  async getProposalBookingByProposalPk(
    proposalPk: number,
    filter?: ProposalBookingFilter
  ): Promise<{ id: number } | null> {
    const result: ScheduledEventRecord = await database<ScheduledEventRecord>(
      'scheduled_events'
    )
      .select()
      .where('proposal_pk', proposalPk)
      .modify((qb) => {
        if (filter?.status) {
          qb.whereIn('status', filter.status);
        }
      })
      .first();

    if (result) {
      return { id: result.proposal_booking_id };
    } else {
      return null;
    }
  }

  async proposalBookingScheduledEvents(
    proposalBookingId: number,
    filter?: ProposalBookingScheduledEventFilterCore
  ): Promise<ScheduledEventCore[] | null> {
    const scheduledEventRecords: ScheduledEventRecord[] =
      await database<ScheduledEventRecord>('scheduled_events')
        .select()
        .where('proposal_booking_id', proposalBookingId)
        .orderBy('starts_at', 'asc')
        .modify((qb) => {
          if (filter?.status) {
            qb.whereIn('status', filter.status);
          }
          if (filter?.bookingType) {
            qb.where('booking_type', filter.bookingType);
          }

          if (filter?.endsAfter !== undefined && filter?.endsAfter !== null) {
            qb.where('ends_at', '>=', filter.endsAfter);
          }

          if (filter?.endsBefore !== undefined && filter.endsBefore !== null) {
            qb.where('ends_at', '<=', filter.endsBefore);
          }
        });

    return scheduledEventRecords.map(createScheduledEventObject);
  }

  async addProposalBookingScheduledEvent(
    eventMessage: ScheduledEventCore
  ): Promise<void> {
    const [addedScheduledEvent]: ScheduledEventRecord[] = await database
      .insert({
        scheduled_event_id: eventMessage.id,
        booking_type: eventMessage.bookingType,
        starts_at: eventMessage.startsAt,
        ends_at: eventMessage.endsAt,
        proposal_booking_id: eventMessage.proposalBookingId,
        proposal_pk: eventMessage.proposalPk,
        status: eventMessage.status,
        local_contact: eventMessage.localContactId,
      })
      .into('scheduled_events')
      .returning(['*']);

    if (!addedScheduledEvent) {
      throw new Error(
        `Failed to add proposal booking scheduled event '${eventMessage.id}'`
      );
    }
  }

  async updateProposalBookingScheduledEvent(
    eventToUpdate: ScheduledEventCore
  ): Promise<void> {
    const [updatedScheduledEvent]: ScheduledEventRecord[] = await database(
      'scheduled_events'
    )
      .update({
        starts_at: eventToUpdate.startsAt,
        ends_at: eventToUpdate.endsAt,
        status: eventToUpdate.status,
        local_contact: eventToUpdate.localContactId,
      })
      .where('scheduled_event_id', eventToUpdate.id)
      .andWhere('proposal_booking_id', eventToUpdate.proposalBookingId)
      .returning(['*']);

    if (!updatedScheduledEvent) {
      throw new Error(
        `Failed to update proposal booking scheduled event '${eventToUpdate.id}'`
      );
    }
  }

  async removeProposalBookingScheduledEvents(
    eventMessage: ScheduledEventCore[]
  ): Promise<void> {
    const [removedScheduledEvent]: ScheduledEventRecord[] = await database(
      'scheduled_events'
    )
      .whereIn(
        'scheduled_event_id',
        eventMessage.map((event) => event.id)
      )
      .andWhere('proposal_booking_id', eventMessage[0].proposalBookingId)
      .del()
      .returning('*');

    if (!removedScheduledEvent) {
      throw new Error(
        `Could not delete scheduled events with ids: ${eventMessage
          .map((event) => event.id)
          .join(', ')} `
      );
    }
  }

  async getRelatedUsersOnProposals(id: number): Promise<number[]> {
    const relatedCoIs = await database
      .select('ou.user_id')
      .distinct()
      .from('proposals as p')
      .leftJoin('proposal_user as u', function () {
        this.on('u.proposal_pk', 'p.proposal_pk');
        this.andOn(function () {
          this.onVal('u.user_id', id); // user is on the proposal
          this.orOnVal('p.proposer_id', id); // user is the proposal PI
        });
      }) // this gives a list of proposals that a user is related to
      .join('proposal_user as ou', { 'ou.proposal_pk': 'u.proposal_pk' }); // this gives us all of the associated coIs

    const relatedPis = await database
      .select('p.proposer_id')
      .distinct()
      .from('proposals as p')
      .leftJoin('proposal_user as u', {
        'u.proposal_pk': 'p.proposal_pk',
        'u.user_id': id,
      }); // this gives a list of proposals that a user is related to

    const relatedUsers = [
      ...relatedCoIs.map((r) => r.user_id),
      ...relatedPis.map((r) => r.proposer_id),
    ];

    return relatedUsers;
  }
}
