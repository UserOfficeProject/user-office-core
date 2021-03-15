/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable jest/valid-expect */
/* eslint-disable quotes */
import 'reflect-metadata';

import BluePromise from 'bluebird';

import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import database from './database';
import ProposalDataSource from './ProposalDataSource';
import { createCallObject, createProposalObject } from './records';

const proposalDataSource = new ProposalDataSource();

async function createProposal(callId: number): Promise<Proposal> {
  const proposal = await database('proposals')
    .insert({
      title: '[IT] proposal',
      call_id: callId,
      questionary_id: 1,
      status_id: 1,
    })
    .returning('*');

  return createProposalObject(proposal[0]);
}

async function createCall(format?: string): Promise<Call> {
  const call = await database('call')
    .modify(query => {
      if (format) {
        query.insert({
          call_id: -999,
          call_short_code: '[IT] call',
          start_call: new Date(),
          end_call: new Date(),
          start_review: new Date(),
          end_review: new Date(),
          start_notify: new Date(),
          end_notify: new Date(),
          cycle_comment: '',
          survey_comment: '',
          start_cycle: new Date(),
          end_cycle: new Date(),
          reference_number_format: format,
        });
      } else {
        query.insert({
          call_id: -999,
          call_short_code: '[IT] call',
          start_call: new Date(),
          end_call: new Date(),
          start_review: new Date(),
          end_review: new Date(),
          start_notify: new Date(),
          end_notify: new Date(),
          cycle_comment: '',
          survey_comment: '',
          start_cycle: new Date(),
          end_cycle: new Date(),
        });
      }
    })
    .returning('*');

  return createCallObject(call[0]);
}

async function getCall(id: number): Promise<Call> {
  const call = await database('call')
    .select()
    .table('call')
    .where('call_id', id)
    .first();

  return createCallObject(call);
}

async function getProposal(id: number): Promise<Proposal> {
  const proposal = await database
    .select()
    .table('proposals')
    .where('proposal_id', id)
    .first();

  return createProposalObject(proposal);
}

async function setup() {
  await database('templates').insert({
    template_id: -999,
    name: '[IT] template',
    category_id: 1,
  });

  await database('questionaries').insert({
    questionary_id: -999,
    created_at: new Date(),
  });

  await database('proposal_workflows').insert({
    proposal_workflow_id: -999,
    name: '[IT] workflow',
    description: 'Integration test workflow',
  });
}

async function teardown() {
  await database('questionaries')
    .where('questionary_id', -999)
    .del();

  await database('proposals')
    .where('title', 'like', '[IT] proposal%')
    .del();

  await database('call')
    .where('call_id', -999)
    .del();

  await database('templates')
    .where('template_id', -999)
    .del();

  await database('proposal_workflows')
    .where('proposal_workflow_id', -999)
    .del();
}

beforeAll(async () => {
  await teardown();
});

beforeEach(async () => {
  await setup();
});

afterEach(async () => {
  await teardown();
});

afterAll(async () => {
  await database.destroy();
});

describe('Submit proposal', () => {
  test('In a call without a reference number format, the proposal is submitted without a reference number', async () => {
    const call = await createCall();
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.id);

    return expect(submission).resolves.toMatchObject({
      shortCode: proposal.shortCode,
      submitted: true,
    });
  });

  test("In a call without a reference number format, the call's sequence number is updated", async () => {
    const call = await createCall();
    const proposal = await createProposal(call.id);
    await proposalDataSource.submitProposal(proposal.id);

    const result = getCall(call.id);

    return expect(result).resolves.toEqual(
      expect.objectContaining({
        proposalSequence: 1,
      })
    );
  });

  test('In a call without a reference number format, the proposal is still given a reference number sequence', async () => {
    const call = await createCall();
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.id);

    return expect(submission).resolves.toMatchObject({
      referenceNumberSequence: 0,
      submitted: true,
    });
  });

  test('In a call with a reference number format, the proposal is given a valid reference number', async () => {
    const call = await createCall('211{digits:4}');
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.id);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        shortCode: '2110000',
      })
    );
  });

  test("In a call with a reference number format, the proposal's reference number sequence is updated", async () => {
    const call = await createCall('211{digits:4}');
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.id);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        referenceNumberSequence: 0,
      })
    );
  });

  test("In a call with a reference number format, the call's sequence number is updated", async () => {
    const call = await createCall('211{digits:4}');
    const proposal = await createProposal(call.id);
    await proposalDataSource.submitProposal(proposal.id);

    const result = getCall(call.id);

    return expect(result).resolves.toEqual(
      expect.objectContaining({
        proposalSequence: 1,
      })
    );
  });

  test('In a call with a reference number format that has no prefix, the proposal and call remain unmodified', async () => {
    const preSubmitCall = await createCall('{digits:4}');
    const preSubmitProposal = await createProposal(preSubmitCall.id);

    expect(async () => {
      await proposalDataSource.submitProposal(preSubmitProposal.id);
    }).rejects.toThrowError('Failed to submit');
    expect(await getCall(preSubmitCall.id)).toMatchObject(preSubmitCall);
    expect(await getProposal(preSubmitProposal.id)).toMatchObject(
      preSubmitProposal
    );
  });

  test('In a call with a reference number format that has a prefix but no parameters, the proposal and call remain unmodified', async () => {
    const preSubmitCall = await createCall('211');
    const preSubmitProposal = await createProposal(preSubmitCall.id);

    expect(async () => {
      await proposalDataSource.submitProposal(preSubmitProposal.id);
    }).rejects.toThrowError('Failed to submit');
    expect(await getCall(preSubmitCall.id)).toMatchObject(preSubmitCall);
    expect(await getProposal(preSubmitProposal.id)).toMatchObject(
      preSubmitProposal
    );
  });

  test('In a call with a reference number format has a prefix, digits parameter and other parameters, the proposal is given a valid reference number', async () => {
    const call = await createCall('211{digits:4}{other:param}text');
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.id);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        shortCode: '2110000',
        submitted: true,
      })
    );
  });

  test('In a call with a reference number format, when 1000 proposals are submitted simultaneously, all are submitted with unique reference numbers', async () => {
    const call = await createCall('211{digits:4}');
    const expectedRefNums: string[] = [];
    const proposals = await BluePromise.mapSeries(
      new Array(1000),
      async function(_prop, index) {
        expectedRefNums.push('211' + String(index).padStart(4, '0'));

        return await createProposal(call.id);
      }
    );

    const submissions = await BluePromise.map(
      proposals,
      async p => await proposalDataSource.submitProposal(p.id)
    );

    const invalidSubmissions = submissions.filter(
      s =>
        !s.submitted ||
        !(s.referenceNumberSequence || s.referenceNumberSequence == 0) ||
        !expectedRefNums.includes(s.shortCode)
    );

    expect(invalidSubmissions.length).toBe(0);
    expect(getCall(call.id)).resolves.toMatchObject({
      proposalSequence: proposals.length,
    });
  });
});
