/* eslint-disable quotes */
import { logger } from '@user-office-software/duo-logger';
import { GraphQLError } from 'graphql';
import { Knex } from 'knex';
import { inject, injectable } from 'tsyringe';

import { Tokens } from '../../config/Tokens';
import { Event } from '../../events/event.enum';
import { Call } from '../../models/Call';
import { Proposal, Proposals } from '../../models/Proposal';
import { ProposalView } from '../../models/ProposalView';
import { ProposalWorkflowConnection } from '../../models/ProposalWorkflowConnections';
import { getQuestionDefinition } from '../../models/questionTypes/QuestionRegistry';
import { ReviewerFilter } from '../../models/Review';
import { Roles } from '../../models/Role';
import { ScheduledEventCore } from '../../models/ScheduledEventCore';
import { SettingsId } from '../../models/Settings';
import { TechnicalReview } from '../../models/TechnicalReview';
import { UserWithRole } from '../../models/User';
import { UpdateTechnicalReviewAssigneeInput } from '../../resolvers/mutations/UpdateTechnicalReviewAssigneeMutation';
import {
  ProposalBookingFilter,
  ProposalBookingScheduledEventFilterCore,
} from '../../resolvers/types/ProposalBooking';
import { UserProposalsFilter } from '../../resolvers/types/User';
import { removeDuplicates } from '../../utils/helperFunctions';
import { AdminDataSource } from '../AdminDataSource';
import { ProposalDataSource } from '../ProposalDataSource';
import { ProposalSettingsDataSource } from '../ProposalSettingsDataSource';
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
  ProposalWorkflowConnectionRecord,
  ScheduledEventRecord,
  StatusChangingEventRecord,
  TechnicalReviewRecord,
} from './records';

const fieldMap: { [key: string]: string } = {
  finalStatus: 'final_status',
  'technicalReviews.status': "technical_reviews->0->'status'",
  'technicalReviews.timeAllocation': "technical_reviews->0->'timeAllocation'",
  // NOTE: For now sorting by first name only is completly fine because the full name is constructed from frist + last
  technicalReviewAssigneesFullName:
    "technical_reviews->0->'technicalReviewAssignee'->'firstname'",
  'faps.code': "faps->0->'code'",
  callShortCode: 'call_short_code',
  'instruments.name': "instruments->0->'name'",
  statusName: 'proposal_status_id',
  'instruments.managementTimeAllocation':
    "instruments->0->'managementTimeAllocation'",
  proposalId: 'proposal_id',
  title: 'title',
  submitted: 'submitted',
  notified: 'notified',
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
  constructor(
    @inject(Tokens.ProposalSettingsDataSource)
    private proposalSettingsDataSource: ProposalSettingsDataSource,
    @inject(Tokens.AdminDataSource)
    private AdminDataSource: AdminDataSource
  ) {}

  async updateProposalTechnicalReviewer({
    userId,
    proposalPks,
    instrumentId,
  }: UpdateTechnicalReviewAssigneeInput): Promise<TechnicalReview[]> {
    const response = await database('technical_review')
      .update('technical_review_assignee_id', userId)
      .whereIn('proposal_pk', proposalPks)
      .andWhere('instrument_id', instrumentId)
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
              throw new GraphQLError(
                `Failed to calculate reference number for proposal with id '${primaryKey}' using format '${call.reference_number_format}'`
              );
            } else if (ref.length > 16) {
              throw new GraphQLError(
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
                  submitted_date: new Date(),
                });
              } else {
                query.update({
                  reference_number_sequence: call.proposal_sequence ?? 0,
                  submitted: true,
                  submitted_date: new Date(),
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
      throw new GraphQLError(
        `Failed to submit proposal with id '${primaryKey}'`
      );
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
          throw new GraphQLError(`Could not delete proposal with id:${id}`);
        }

        return createProposalObject(proposal[0]);
      });
  }

  async setProposalUsers(proposalPk: number, userIds: number[]): Promise<void> {
    return database.transaction(async (trx) => {
      return database
        .from('proposal_user')
        .where('proposal_pk', proposalPk)
        .del()
        .transacting(trx)
        .then(() => {
          return Promise.all(
            userIds.map((userId) =>
              database
                .insert({ proposal_pk: proposalPk, user_id: userId })
                .into('proposal_user')
                .transacting(trx)
            )
          );
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
          management_decision_submitted: proposal.managementDecisionSubmitted,
        },
        ['*']
      )
      .from('proposals')
      .where('proposal_pk', proposal.primaryKey)
      .then((records: ProposalRecord[]) => {
        if (records === undefined || !records.length) {
          throw new GraphQLError(`Proposal not found ${proposal.primaryKey}`);
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
          throw new GraphQLError(`Proposal not found ${proposalPk}`);
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

  async getByQuestionaryId(questionaryId: number): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('questionary_id', questionaryId)
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
      throw new GraphQLError(
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
    searchText?: string,
    principleInvestigator?: number[]
  ): Promise<{ totalCount: number; proposalViews: ProposalView[] }> {
    const principalInvestigator = principleInvestigator
      ? principleInvestigator
      : [];

    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .join(
        'users',
        'users.user_id',
        '=',
        'proposal_table_view.principal_investigator'
      )
      .modify((query) => {
        if (filter?.callId) {
          query.where('call_id', filter?.callId);
        }

        if (filter?.instrumentFilter?.showMultiInstrumentProposals) {
          query.whereRaw('jsonb_array_length(instruments) > 1');
        } else if (filter?.instrumentFilter?.instrumentId) {
          // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with id equal to filter.instrumentId
          query.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].id \\? (@.type() == "number" && @ == :instrumentId:)\')',
            { instrumentId: filter.instrumentFilter.instrumentId }
          );
        }

        if (filter?.proposalStatusId) {
          query.where('proposal_status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
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
          query.andWhere((qb) =>
            qb
              .orWhereRaw('proposal_id ILIKE ?', `%${searchText}%`)
              .orWhereRaw('title ILIKE ?', `%${searchText}%`)
              .orWhereRaw('proposal_status_name ILIKE ?', `%${searchText}%`)
              .orWhere('users.email', 'ilike', `%${searchText}%`)
              .orWhere('users.firstname', 'ilike', `%${searchText}%`)
              .orWhere('users.lastname', 'ilike', `%${searchText}%`)
              .orWhere('principal_investigator', 'in', principalInvestigator)
              // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with name equal to searchText case insensitive
              .orWhereRaw(
                'jsonb_path_exists(instruments, \'$[*].name \\? (@.type() == "string" && @ like_regex :searchText: flag "i")\')',
                { searchText }
              )
          );
        }

        if (sortField && sortDirection) {
          if (!fieldMap.hasOwnProperty(sortField)) {
            throw new GraphQLError(`Bad sort field given: ${sortField}`);
          }
          sortField = fieldMap[sortField];
          query.orderByRaw(`${sortField} ${sortDirection}`);
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposal_id', filter.referenceNumbers);
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

        if (filter?.instrumentFilter?.instrumentId) {
          query
            .leftJoin(
              'instrument_has_proposals',
              'instrument_has_proposals.proposal_pk',
              'proposals.proposal_pk'
            )
            .where(
              'instrument_has_proposals.instrument_id',
              filter.instrumentFilter.instrumentId
            );
        }

        if (filter?.templateIds) {
          query
            .leftJoin(
              'questionaries',
              'questionaries.questionary_id',
              'proposals.questionary_id'
            )
            .whereIn('questionaries.template_id', filter.templateIds);
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
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return database
      .select(['*', database.raw('count(*) OVER() AS full_count')])
      .from('proposal_table_view')
      .join(
        'users',
        'users.user_id',
        '=',
        'proposal_table_view.principal_investigator'
      )
      .where(function () {
        if (user.currentRole?.shortCode === Roles.INTERNAL_REVIEWER) {
          // NOTE: Using jsonpath we check the jsonb (technical_reviews) field if it contains internalReviewers array of objects with id equal to user.id
          this.whereRaw(
            'jsonb_path_exists(technical_reviews, \'$[*].internalReviewers[*].id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        } else {
          this.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].scientists[*].id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          ).orWhereRaw(
            'jsonb_path_exists(instruments, \'$[*].managerUserId \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        }
      })
      .distinct('proposal_pk')
      .orderBy('proposal_pk', 'desc')
      .modify((query) => {
        if (filter?.text) {
          query.andWhere((qb) =>
            qb
              .orWhereRaw('title ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('proposal_id ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('proposal_status_name ILIKE ?', `%${filter.text}%`)
              .orWhereRaw('users.email ILIKE', `%${filter.text}%`)
              .orWhereRaw('users.firstname ILIKE', `%${filter.text}%`)
              .orWhereRaw('users.lastname ILIKE', `%${filter.text}%`)
              // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with name equal to searchText case insensitive
              .orWhereRaw(
                'jsonb_path_exists(instruments, \'$[*].name \\? (@.type() == "string" && @ like_regex :searchText: flag "i")\')',
                { searchText: filter.text }
              )
          );
        }
        if (filter?.callId) {
          query.where('call_id', filter.callId);
        }
        if (filter?.reviewer === ReviewerFilter.ME) {
          // NOTE: Using jsonpath we check the jsonb (technical_reviews) field if it contains object with id equal to user.id
          query.whereRaw(
            'jsonb_path_exists(technical_reviews, \'$[*].technicalReviewAssignee.id \\? (@.type() == "number" && @ == :userId:)\')',
            { userId: user.id }
          );
        }

        if (filter?.instrumentFilter?.showMultiInstrumentProposals) {
          query.whereRaw('jsonb_array_length(instruments) > 1');
        } else if (filter?.instrumentFilter?.instrumentId) {
          // NOTE: Using jsonpath we check the jsonb (instruments) field if it contains object with id equal to filter.instrumentId
          query.whereRaw(
            'jsonb_path_exists(instruments, \'$[*].id \\? (@.type() == "number" && @ == :instrumentId:)\')',
            { instrumentId: filter.instrumentFilter?.instrumentId }
          );
        }

        if (filter?.proposalStatusId) {
          query.where('proposal_status_id', filter?.proposalStatusId);
        }

        if (filter?.shortCodes) {
          const filteredAndPreparedShortCodes = filter?.shortCodes
            .filter((shortCode) => shortCode)
            .join('|');

          query.whereRaw(
            `proposal_id similar to '%(${filteredAndPreparedShortCodes})%'`
          );
        }

        if (filter?.questionFilter) {
          const questionFilter = filter.questionFilter;

          this.addQuestionFilter(query, questionFilter);
        }

        if (filter?.referenceNumbers) {
          query.whereIn('proposal_id', filter.referenceNumbers);
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

  async getProposalsByPks(proposalPks: number[]): Promise<Proposal[]> {
    return database('proposals')
      .whereIn('proposal_pk', proposalPks)
      .then((proposals: ProposalRecord[]) =>
        proposals.map((proposal) => createProposalObject(proposal))
      );
  }

  async markEventAsDoneOnProposals(
    event: Event,
    proposalPks: number[]
  ): Promise<ProposalEventsRecord[] | null> {
    const dataToInsert = proposalPks.map((proposalPk) => ({
      proposal_pk: proposalPk,
      [event.toLowerCase()]: true,
    }));

    const result = await database.raw(
      `? ON CONFLICT (proposal_pk)
        DO UPDATE SET
        ${event.toLowerCase()} = true
        RETURNING *;`,
      [database('proposal_events').insert(dataToInsert)]
    );

    if (result.rows && result.rows.length) {
      return result.rows;
    } else {
      return null;
    }
  }

  async getProposalEvents(
    proposalPk: number
  ): Promise<ProposalEventsRecord | null> {
    const result = await database
      .select()
      .from('proposal_events')
      .where('proposal_pk', proposalPk)
      .first();

    if (!result) {
      return null;
    }

    return result;
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

  async cloneProposal(sourceProposal: Proposal, call: Call): Promise<Proposal> {
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
           management_decision_submitted)
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
                 management_decision_submitted
                 
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
    return database.transaction(async (trx) => {
      try {
        const proposalCall: CallRecord = await database('call')
          .select('*')
          .where('call_id', callId)
          .first()
          .transacting(trx);

        if (!proposalCall) {
          logger.logError(
            'Could not reset proposal events because proposal call does not exist',
            { callId }
          );

          throw new GraphQLError('Could not reset proposal events');
        }

        const proposalWorkflowId = proposalCall.proposal_workflow_id;

        const proposalEventsToReset: (StatusChangingEventRecord &
          ProposalWorkflowConnectionRecord)[] = (
          await database
            .raw(
              `
        SELECT *
        FROM proposal_workflow_connections AS pwc
        JOIN status_changing_events
        ON status_changing_events.proposal_workflow_connection_id = pwc.proposal_workflow_connection_id
        WHERE pwc.proposal_workflow_connection_id >= (
          SELECT proposal_workflow_connection_id
          FROM proposal_workflow_connections
          WHERE proposal_workflow_id = ${proposalWorkflowId}
          AND proposal_status_id = ${statusId}
        )
        AND pwc.proposal_workflow_id = ${proposalWorkflowId};
      `
            )
            .transacting(trx)
        ).rows;

        if (proposalEventsToReset?.length) {
          const dataToUpdate: Record<string, boolean> = {};

          proposalEventsToReset.forEach((event) => {
            const dataToUpdateHasProperty = dataToUpdate.hasOwnProperty(
              event.status_changing_event.toLocaleLowerCase()
            );
            // NOTE: Reset the property only if it is not present in the dataToUpdate otherwise we end up with overwriting existing data.
            if (!dataToUpdateHasProperty) {
              dataToUpdate[event.status_changing_event.toLocaleLowerCase()] =
                false;
            }
          });

          const [updatedProposalEvents] = await database
            .update(dataToUpdate)
            .from('proposal_events')
            .where('proposal_pk', proposalPk)
            .returning<ProposalEventsRecord[]>('*')
            .transacting(trx);

          if (!updatedProposalEvents) {
            logger.logError('Could not reset proposal events', {
              dataToUpdate,
            });

            throw new GraphQLError('Could not reset proposal events');
          }
        }

        return true;
      } catch (error) {
        logger.logException(
          `Failed to reset proposal events proposalPk: ${proposalPk}`,
          error
        );

        return false;
      }
    });
  }

  async changeProposalsStatus(
    statusId: number,
    proposalPks: number[]
  ): Promise<Proposals> {
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

      throw new GraphQLError('Could not change proposals status');
    }

    return new Proposals(result.map((item) => createProposalObject(item)));
  }

  async getProposalBookingsByProposalPk(
    proposalPk: number,
    filter?: ProposalBookingFilter
  ): Promise<{ ids: number[] } | null> {
    const result: ScheduledEventRecord[] = await database<
      ScheduledEventRecord[]
    >('scheduled_events')
      .select()
      .where('proposal_pk', proposalPk)
      .modify((qb) => {
        if (filter?.status) {
          qb.whereIn('status', filter.status);
        }
      });

    if (result) {
      return {
        ids: removeDuplicates(
          result.map((bookingId) => bookingId.proposal_booking_id)
        ),
      };
    } else {
      return null;
    }
  }

  async getAllProposalBookingsScheduledEvents(
    proposalBookingIds: number[],
    filter?: ProposalBookingScheduledEventFilterCore
  ): Promise<ScheduledEventCore[] | null> {
    const scheduledEventRecords: ScheduledEventRecord[] =
      await database<ScheduledEventRecord>('scheduled_events')
        .select()
        .whereIn('proposal_booking_id', proposalBookingIds)
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
        instrument_id: eventMessage.instrumentId,
      })
      .into('scheduled_events')
      .returning(['*']);

    if (!addedScheduledEvent) {
      throw new GraphQLError(
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
      throw new GraphQLError(
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
      .andWhere('instrument_id', eventMessage[0].instrumentId)
      .del()
      .returning('*');

    if (!removedScheduledEvent) {
      throw new GraphQLError(
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

  async getProposalById(proposalId: string): Promise<Proposal | null> {
    return database
      .select()
      .from('proposals')
      .where('proposal_id', proposalId)
      .first()
      .then((proposal: ProposalRecord) => {
        return proposal ? createProposalObject(proposal) : null;
      });
  }

  async doesProposalNeedTechReview(proposalPk: number): Promise<boolean> {
    const workflowStatus = (
      await this.AdminDataSource.getSetting(
        SettingsId.TECH_REVIEW_OPTIONAL_WORKFLOW_STATUS
      )
    )?.settingsValue;

    if (!workflowStatus) {
      return true;
    }

    const proposalWorkflowId: number = await database
      .select('c.proposal_workflow_id')
      .from('proposals as p')
      .join('call as c', { 'p.call_id': 'c.call_id' })
      .where('proposal_pk', proposalPk)
      .first()
      .then((value) => value.proposal_workflow_id);

    const proposalStatus: ProposalWorkflowConnection[] =
      await this.proposalSettingsDataSource.getProposalWorkflowConnections(
        proposalWorkflowId
      );

    return !!proposalStatus.find((status) =>
      status.proposalStatus.shortCode.match(workflowStatus)
    );
  }

  async getTechniqueScientistProposals(
    user: UserWithRole,
    filter?: ProposalsFilter,
    first?: number,
    offset?: number,
    sortField?: string,
    sortDirection?: string,
    searchText?: string
  ): Promise<{ totalCount: number; proposals: ProposalView[] }> {
    return { totalCount: 0, proposals: [] };
  }

  async submitImportedProposal(
    primaryKey: number,
    referenceNumber: string,
    submittedDate: Date
  ): Promise<Proposal | null> {
    await this.submitProposal(primaryKey, referenceNumber);

    const proposal: ProposalRecord[] | undefined = await database
      .from('proposals')
      .where('proposal_pk', primaryKey)
      .update({ submitted_date: submittedDate })
      .returning('*');

    return proposal ? createProposalObject(proposal[0]) : null;
  }
}
