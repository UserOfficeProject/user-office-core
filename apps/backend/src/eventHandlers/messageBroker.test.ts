import 'reflect-metadata';
import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { mapClass } from '../config/utils';
import PostgresCallDataSource from '../datasources/postgres/CallDataSource';
import PostgresDataAccessUsersDataSource from '../datasources/postgres/DataAccessUsersDataSource';
import PostgresInstrumentDataSource from '../datasources/postgres/InstrumentDataSource';
import PostgresSampleDataSource from '../datasources/postgres/SampleDataSource';
import PostgresStatusDataSource from '../datasources/postgres/StatusDataSource';
import PostgresUserDataSource from '../datasources/postgres/UserDataSource';
import database from '../datasources/postgres/database';
import { createProposalObject } from '../datasources/postgres/records';
import { getProposalMessageData } from './messageBroker';

beforeAll(() => {
  mapClass(Tokens.UserDataSource, PostgresUserDataSource);
  mapClass(Tokens.CallDataSource, PostgresCallDataSource);
  mapClass(Tokens.SampleDataSource, PostgresSampleDataSource);
  mapClass(Tokens.DataAccessUsersDataSource, PostgresDataAccessUsersDataSource);
  mapClass(Tokens.InstrumentDataSource, PostgresInstrumentDataSource);
  mapClass(Tokens.StatusDataSource, PostgresStatusDataSource);
});

afterAll(async () => {
  await database.destroy();
});

describe('getProposalMessageData', () => {
  let proposalPk: number;

  async function setup() {
    await database('institutions').insert({
      institution_id: -999,
      institution: '[IT] Test Institution',
      country_id: 1,
      ror_id: null,
    });

    await database('users').insert({
      user_id: -999,
      user_title: 'Dr.',
      firstname: '[IT]',
      lastname: 'Tester',
      preferredname: '[IT]',
      oidc_sub: '[IT]-oidc-sub',
      oauth_refresh_token: '',
      oauth_issuer: '',
      institution_id: -999,
      email: 'it-messageBroker@test.com',
    });

    await database('call').insert({
      call_id: -999,
      call_short_code: '[IT] call',
      start_call: new Date(),
      end_call: new Date(),
      start_review: new Date(),
      end_review: new Date(),
      start_notify: new Date(),
      end_notify: new Date(),
      cycle_comment: '',
      start_cycle: new Date(),
      end_cycle: new Date(),
    });

    await database('questionaries').insert({
      questionary_id: -999,
      created_at: new Date(),
    });

    const [proposalRecord] = await database('proposals')
      .insert({
        title: '[IT] Test proposal',
        abstract: '[IT] abstract',
        status_id: 1,
        proposer_id: -999,
        call_id: -999,
        questionary_id: -999,
        submitted: true,
      })
      .returning('*');

    proposalPk = proposalRecord.proposal_pk;

    await database('proposal_user').insert({
      user_id: -999,
      proposal_pk: proposalPk,
    });
  }

  async function teardown() {
    if (proposalPk) {
      await database('proposal_user').where('proposal_pk', proposalPk).del();
      await database('proposals').where('proposal_pk', proposalPk).del();
    }
    await database('questionaries').where('questionary_id', -999).del();
    await database('call').where('call_id', -999).del();
    await database('users').where('user_id', -999).del();
    await database('institutions').where('institution_id', -999).del();
  }

  beforeEach(async () => {
    await teardown();
    await setup();
  });

  afterEach(async () => {
    await teardown();
  });

  test('includes institution and country in proposer data', async () => {
    const proposalRecord = await database('proposals')
      .where('proposal_pk', proposalPk)
      .first();
    const proposal = createProposalObject(proposalRecord);

    const result = await getProposalMessageData(proposal);
    const data = JSON.parse(result);

    expect(data.proposer.institution.name).toBe('[IT] Test Institution');
    expect(data.proposer.country.country).toBeDefined();
  });

  test('includes institution and country for all proposal members', async () => {
    const proposalRecord = await database('proposals')
      .where('proposal_pk', proposalPk)
      .first();
    const proposal = createProposalObject(proposalRecord);

    const result = await getProposalMessageData(proposal);
    const data = JSON.parse(result);

    expect(data.members).toHaveLength(1);
    expect(data.members[0].institution.name).toBe('[IT] Test Institution');
    expect(data.members[0].country.country).toBeDefined();
  });
});
