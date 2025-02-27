/* eslint-disable jest/valid-expect */
/* eslint-disable quotes */
import 'reflect-metadata';

import { Call } from '../../models/Call';
import { Proposal } from '../../models/Proposal';
import { WorkflowType } from '../../models/Workflow';
import { dummyCallFactory } from '../mockups/CallDataSource';
import CallDataSource from './CallDataSource';
import database from './database';
import { CallRecord, createCallObject, createProposalObject } from './records';

const callDataSource = new CallDataSource();

const today = new Date();

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

async function getProposalsInCall(callId: number): Promise<Proposal[]> {
  const proposals = await database
    .select()
    .table('proposals')
    .where('call_id', callId);

  return proposals.map((p) => createProposalObject(p));
}

async function createCall(
  args: {
    format?: string;
    callEnded?: boolean;
    callEndedInternal?: boolean;
    endCall?: Date;
    endCallInternal?: Date;
  } = {}
): Promise<Call> {
  const call: CallRecord[] = await database('call')
    .insert({
      call_id: -999,
      call_short_code: '[IT] call',
      start_call: yesterday,
      start_review: yesterday,
      end_review: tomorrow,
      start_notify: yesterday,
      end_notify: tomorrow,
      start_cycle: yesterday,
      end_cycle: tomorrow,
      cycle_comment: '',
      survey_comment: '',
      ...(args.format && { reference_number_format: args.format }),
      ...(args.callEnded && { call_ended: args.callEnded }),
      ...(args.callEndedInternal && {
        call_ended_internal: args.callEndedInternal,
      }),
      ...((args.endCall && { end_call: args.endCall }) || {
        end_call: tomorrow,
      }),
      ...((args.endCallInternal && {
        end_call_internal: args.endCallInternal,
      }) || {
        end_call_internal: tomorrow,
      }),
    } as CallRecord)
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

  await database('workflows').insert({
    workflow_id: -999,
    name: '[IT] workflow',
    description: 'Integration test workflow',
    entity_type: WorkflowType.PROPOSAL,
  });
}

async function teardown() {
  await database('proposals').where('title', 'like', '[IT] proposal%').del();

  await database('questionaries').where('questionary_id', -999).del();

  await database('call').where('call_id', -999).del();

  await database('templates').where('template_id', -999).del();

  await database('templates').where('template_id', -998).del();

  await database('workflows')
    .where('proposal_id', -999)
    .andWhere('entity_type', WorkflowType.PROPOSAL)
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

describe('Call update with reference numbers', () => {
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
    const call = await createCall({ format: '192{digits:4}' });
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
    const call = await createCall({ format: '211{digits:4}' });
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
    const call = await createCall({ format: '211{digits:4}' });
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
    const call = await createCall({ format: '192{digits:4}' });
    const expectedRefNums: string[] = [];
    await Promise.all(
      new Array(1000).map(async (_prop, index) => {
        expectedRefNums.push('221' + String(index).padStart(5, '0'));

        return await createSubmittedProposal(call.id, index, index);
      })
    );

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

describe('Call update with call ended flags', () => {
  test('When a call is updated with a future call end date, the call ended flag is changed to false', async () => {
    const initialValues = { callEnded: true, endCall: yesterday };
    const call = await createCall(initialValues);
    expect(call).toEqual(expect.objectContaining(initialValues));

    expect(
      await callDataSource.update({
        id: call.id,
        endCall: tomorrow,
      })
    ).toEqual(
      expect.objectContaining({
        endCall: tomorrow,
        callEnded: !initialValues.callEnded,
      })
    );
  });

  test('When a call is updated with a future internal call end date, the internal call ended flag is changed to false', async () => {
    const initialValues = {
      callEndedInternal: true,
      endCallInternal: yesterday,
    };
    const call = await createCall(initialValues);
    expect(call).toEqual(expect.objectContaining(initialValues));

    expect(
      await callDataSource.update({
        id: call.id,
        endCallInternal: tomorrow,
      })
    ).toEqual(
      expect.objectContaining({
        endCallInternal: tomorrow,
        callEndedInternal: !initialValues.callEndedInternal,
      })
    );
  });

  test('When a call is updated with a past call end date, the call ended flag is left as its previous value', async () => {
    const initialValues = { callEnded: false, endCall: tomorrow };
    const call = await createCall(initialValues);
    expect(call).toEqual(expect.objectContaining(initialValues));

    expect(
      await callDataSource.update({
        id: call.id,
        endCall: yesterday,
      })
    ).toEqual(
      expect.objectContaining({
        endCall: yesterday,
        callEnded: initialValues.callEnded,
      })
    );
  });

  test('When a call is updated with a past internal call end date, the internal call ended flag is left as its previous value', async () => {
    const initialValues = {
      callEndedInternal: false,
      endCallInternal: tomorrow,
    };
    const call = await createCall(initialValues);
    expect(call).toEqual(expect.objectContaining(initialValues));

    expect(
      await callDataSource.update({
        id: call.id,
        endCallInternal: yesterday,
      })
    ).toEqual(
      expect.objectContaining({
        endCallInternal: yesterday,
        callEndedInternal: initialValues.callEndedInternal,
      })
    );
  });
});
