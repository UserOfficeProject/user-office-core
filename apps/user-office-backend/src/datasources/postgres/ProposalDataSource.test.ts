/* eslint-disable jest/valid-expect */
/* eslint-disable quotes */
import 'reflect-metadata';
import BluePromise from 'bluebird';
import { container } from 'tsyringe';

import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import database from './database';
import ProposalDataSource from './ProposalDataSource';
import { createCallObject, createProposalObject } from './records';

const proposalDataSource = container.resolve(ProposalDataSource);

async function createProposal(callId: number): Promise<Proposal> {
  const proposal = await database('proposals')
    .insert({
      title: '[IT] proposal',
      call_id: callId,
      questionary_id: -999,
      status_id: 1,
    })
    .returning('*');

  return createProposalObject(proposal[0]);
}

async function createCall(format?: string): Promise<Call> {
  const call = await database('call')
    .modify((query) => {
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
    .where('proposal_pk', id)
    .first();

  return createProposalObject(proposal);
}

async function setup() {
  await database('templates').insert({
    template_id: -999,
    name: '[IT] template',
    group_id: 'PROPOSAL',
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
  await database('proposals').where('title', 'like', '[IT] proposal%').del();

  await database('questionaries').where('questionary_id', -999).del();

  await database('call').where('call_id', -999).del();

  await database('templates').where('template_id', -999).del();

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

    const submission = proposalDataSource.submitProposal(proposal.primaryKey);

    return expect(submission).resolves.toMatchObject({
      proposalId: proposal.proposalId,
      submitted: true,
    });
  });

  test("In a call without a reference number format, the call's sequence number is updated", async () => {
    const call = await createCall();
    const proposal = await createProposal(call.id);
    await proposalDataSource.submitProposal(proposal.primaryKey);

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

    const submission = proposalDataSource.submitProposal(proposal.primaryKey);

    return expect(submission).resolves.toMatchObject({
      referenceNumberSequence: 0,
      submitted: true,
    });
  });

  test('In a call with a reference number format, the proposal is given a valid reference number', async () => {
    const call = await createCall('211{digits:4}');
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.primaryKey);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        proposalId: '2110000',
      })
    );
  });

  test("In a call with a reference number format, the proposal's reference number sequence is updated", async () => {
    const call = await createCall('211{digits:4}');
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.primaryKey);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        referenceNumberSequence: 0,
      })
    );
  });

  test("In a call with a reference number format, the call's sequence number is updated", async () => {
    const call = await createCall('211{digits:4}');
    const proposal = await createProposal(call.id);
    await proposalDataSource.submitProposal(proposal.primaryKey);

    const result = getCall(call.id);

    return expect(result).resolves.toEqual(
      expect.objectContaining({
        proposalSequence: 1,
      })
    );
  });

  test('In a call with a reference number format has a prefix, digits parameter and other parameters, the proposal is given a valid reference number', async () => {
    const call = await createCall('211{digits:4}{other:param}text');
    const proposal = await createProposal(call.id);

    const submission = proposalDataSource.submitProposal(proposal.primaryKey);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        proposalId: '2110000',
        submitted: true,
      })
    );
  });

  test('In a call with a reference number format, when 1000 proposals are submitted simultaneously, all are submitted with unique reference numbers', async () => {
    const call = await createCall('211{digits:4}');
    const expectedRefNums: string[] = [];
    const proposals = await BluePromise.mapSeries(
      new Array(1000),
      async function (_prop, index) {
        expectedRefNums.push('211' + String(index).padStart(4, '0'));

        return await createProposal(call.id);
      }
    );

    const submissions = await BluePromise.map(
      proposals,
      async (p) => await proposalDataSource.submitProposal(p.primaryKey)
    );

    const invalidSubmissions = submissions.filter(
      (s) =>
        !s.submitted ||
        !(s.referenceNumberSequence || s.referenceNumberSequence == 0) ||
        !expectedRefNums.includes(s.proposalId)
    );

    expect(invalidSubmissions.length).toBe(0);
    expect(getCall(call.id)).resolves.toMatchObject({
      proposalSequence: proposals.length,
    });
  });

  test('In a call with a reference number format, when a cloned proposal is submitted, it is given a unique reference number', async () => {
    const call = await createCall('211{digits:4}{other:param}text');
    const original = await createProposal(call.id);
    await proposalDataSource.submitProposal(original.primaryKey);
    const cloned = await proposalDataSource.cloneProposal(original);

    const submission = proposalDataSource.submitProposal(cloned.primaryKey);

    return expect(submission).resolves.toEqual(
      expect.objectContaining({
        proposalId: '2110001',
        submitted: true,
        referenceNumberSequence: 1,
      })
    );
  });

  test('In a call with an invalid reference number format, the proposal fails to submit', async () => {
    const call = await createCall('*invalid*');
    const proposal = await createProposal(call.id);

    expect(async () => {
      await proposalDataSource.submitProposal(proposal.primaryKey);
    }).rejects.toThrowError('Failed to submit');
    expect(getProposal(proposal.primaryKey)).resolves.toEqual(
      expect.objectContaining({
        proposalId: proposal.proposalId,
        submitted: false,
        referenceNumberSequence: null,
      })
    );
  });

  test('In a call with a valid reference number format that would make a reference number too long, the proposal fails to submit', async () => {
    const call = await createCall('211{digits:14}');
    const proposal = await createProposal(call.id);

    expect(async () => {
      await proposalDataSource.submitProposal(proposal.primaryKey);
    }).rejects.toThrowError('Failed to submit');
    expect(getProposal(proposal.primaryKey)).resolves.toEqual(
      expect.objectContaining({
        proposalId: proposal.proposalId,
        submitted: false,
        referenceNumberSequence: null,
      })
    );
  });
});
