/* eslint-disable jest/valid-expect */
/* eslint-disable quotes */
import 'reflect-metadata';

import BluePromise from 'bluebird';

import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import { dummyCallFactory } from '../mockups/CallDataSource';
import CallDataSource from './CallDataSource';
import database from './database';
import { createCallObject, createProposalObject } from './records';

const callDataSource = new CallDataSource();

async function getProposalsInCall(callId: number): Promise<Proposal[]> {
  const proposals = await database
    .select()
    .table('proposals')
    .where('call_id', callId);

  return proposals.map((p) => createProposalObject(p));
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

async function createSubmittedProposal(
  callId: number,
  proposalId: number,
  sequence: number
) {
  const proposal = await database('proposals')
    .insert({
      title: '[IT] proposal',
      call_id: callId,
      questionary_id: -999,
      proposal_id: proposalId,
      status_id: 1,
      submitted: true,
      reference_number_sequence: sequence,
    })
    .returning('*');

  return createProposalObject(proposal[0]);
}

async function setup() {
  await database('templates').insert({
    template_id: -999,
    name: '[IT] proposal template',
    group_id: 'PROPOSAL',
  });

  await database('templates').insert({
    template_id: -998,
    name: '[IT] proposal ESI template',
    group_id: 'PROPOSAL_ESI',
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

  await database('templates').where('template_id', -998).del();

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

describe('Call update', () => {
  test('When updated with a reference number format after one did not exist, all proposals in the call are updated to use the new format', async () => {
    const call = await createCall();
    const expectedRefNums: string[] = [];
    for (let i = 0; i < 1000; i++) {
      await createSubmittedProposal(call.id, i, i);
      expectedRefNums.push('211' + String(i).padStart(4, '0'));
    }

    await callDataSource.update(
      dummyCallFactory({
        id: call.id,
        referenceNumberFormat: '211{digits:4}',
        proposalWorkflowId: -999,
        esiTemplateId: -998,
      })
    );
    const invalidUpdates = (await getProposalsInCall(call.id)).filter(
      (p) => !expectedRefNums.includes(p.proposalId)
    );

    expect(invalidUpdates.length).toBe(0);
  });

  test('When updated with a reference number format after one already existed, all proposals in the call are updated to use the new format', async () => {
    const call = await createCall('192{digits:4}');
    const expectedRefNums: string[] = [];
    for (let i = 0; i < 100; i++) {
      await createSubmittedProposal(call.id, i, i);
      expectedRefNums.push('211' + String(i).padStart(5, '0'));
    }

    await callDataSource.update(
      dummyCallFactory({
        id: call.id,
        referenceNumberFormat: '211{digits:5}',
        proposalWorkflowId: -999,
        esiTemplateId: -998,
      })
    );
    const invalidUpdates = (await getProposalsInCall(call.id)).filter(
      (p) => !expectedRefNums.includes(p.proposalId)
    );

    expect(invalidUpdates.length).toBe(0);
  });

  test('When a reference number format is removed, proposals retain their reference numbers', async () => {
    const call = await createCall('211{digits:4}');
    const expectedRefNums: string[] = [];
    for (let i = 0; i < 100; i++) {
      const refNum = '211' + String(i).padStart(4, '0');
      await createSubmittedProposal(call.id, Number(refNum), i);
      expectedRefNums.push(refNum);
    }

    await callDataSource.update(
      dummyCallFactory({
        id: call.id,
        referenceNumberFormat: '',
        proposalWorkflowId: -999,
        esiTemplateId: -998,
      })
    );
    const invalidUpdates = (await getProposalsInCall(call.id)).filter(
      (p) => !expectedRefNums.includes(p.proposalId)
    );

    expect(invalidUpdates.length).toBe(0);
  });

  test('When a reference number format is removed, proposals retain their sequence numbers', async () => {
    const call = await createCall('211{digits:4}');
    const p1 = await createSubmittedProposal(call.id, 123, 123);
    const p2 = await createSubmittedProposal(call.id, 456, 456);
    const p3 = await createSubmittedProposal(call.id, 789, 789);

    await callDataSource.update(
      dummyCallFactory({
        id: call.id,
        referenceNumberFormat: '',
        proposalWorkflowId: -999,
        esiTemplateId: -998,
      })
    );

    expect(getProposalsInCall(call.id)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          primaryKey: p1.primaryKey,
          referenceNumberSequence: 123,
        }),
        expect.objectContaining({
          primaryKey: p2.primaryKey,
          referenceNumberSequence: 456,
        }),
        expect.objectContaining({
          primaryKey: p3.primaryKey,
          referenceNumberSequence: 789,
        }),
      ])
    );
  });

  test('In a call with 1000 proposals, when the format is changed, all proposals are correctly updated', async () => {
    const call = await createCall('192{digits:4}');
    const expectedRefNums: string[] = [];
    await BluePromise.mapSeries(new Array(1000), async function (_prop, index) {
      expectedRefNums.push('221' + String(index).padStart(5, '0'));

      return await createSubmittedProposal(call.id, index, index);
    });

    await callDataSource.update(
      dummyCallFactory({
        id: call.id,
        referenceNumberFormat: '221{digits:5}',
        proposalWorkflowId: -999,
        esiTemplateId: -998,
      })
    );

    const proposals = await getProposalsInCall(call.id);
    const invalidProposals = proposals.filter(
      (s) => !expectedRefNums.includes(s.proposalId)
    );

    expect(invalidProposals.length).toBe(0);
  });
});
