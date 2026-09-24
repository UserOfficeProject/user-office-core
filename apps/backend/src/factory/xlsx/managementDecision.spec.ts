import {
  addDecreasingInstrumentAvailTime,
  generateManagementDecisionData,
  collectManagementDecisionData,
} from './managementDecision';
import baseContext from '../../buildContext';
import { dummyUserWithRole } from '../../datasources/mockups/UserDataSource';
import { FapReviewsRecord } from '../../datasources/postgres/records';
import { FapMeetingDecision } from '../../models/FapMeetingDecision';
import { Proposal, ProposalEndStatus } from '../../models/Proposal';
import { User } from '../../models/User';

const mockProposal = new Proposal(
  1, // primaryKey
  'Test Proposal', // title
  'Test abstract', // abstract
  123, // proposerId
  1, // workflowStatusId
  new Date(),
  new Date(),
  'PROP-001',
  ProposalEndStatus.ACCEPTED,
  1, // callId
  1, // questionaryId
  'User comment',
  'proposal management comment',
  false, // notified
  true, // submitted
  1, // referenceNumberSequence
  false, // managementDecisionSubmitted
  new Date(),
  null, // experimentSequence
  null // fileId
);

const mockUser = new User(
  123, // id
  'Mr', // userTitle
  'Zachary', // firstname
  'Hankin', // lastname
  'zachary', // preferredname
  'oidc-sub-123', // oidcSub
  null, // oauthRefreshToken
  null, // oauthIssuer
  1, // institutionId
  'Diamond Light Source', // institution
  'zachary.hankin@example.com', // email
  '2026-01-01T00:00:00.000Z', // created
  '2026-01-01T00:00:00.000Z' // updated
);

const mockFapMeetingDecision = new FapMeetingDecision(
  123, // proposalPk
  1, // rankOrder
  ProposalEndStatus.ACCEPTED, // recommendation
  'Comment for user', // commentForUser
  'Comment for management', // commentForManagement
  true, // submitted
  456, // submittedBy
  789, // instrumentId
  101 // fapId
);

const mockFapReview: FapReviewsRecord = {
  proposal_pk: 123,
  proposal_id: 456,
  title: 'Test Proposal',
  instrument_name: 'Instrument A',
  availability_time: 100,
  time_allocation: 20,
  fap_id: 1,
  rank_order: 1,
  call_id: 2,
  proposer_id: 789,
  instrument_id: 3,
  fap_time_allocation: 10,
  average_grade: 4.5,
  questionary_id: 4,
  comment: 'FAP review comment',
};

describe('addDecreasingInstrumentAvailTime test', () => {
  test('Ensure orders an input 1 then 2', () => {
    const managementDecisionData = [
      {
        grade: 1,
        instrumentAllocatedTime: 10,
        xlsxrowdata: ['example'],
      },
      {
        grade: 2,
        instrumentAllocatedTime: 10,
        xlsxrowdata: ['example'],
      },
    ];

    addDecreasingInstrumentAvailTime(managementDecisionData, 10);
    expect(managementDecisionData[0].grade).toEqual(1);
  });

  test('Ensure orders an input 2 then 1', () => {
    const managementDecisionData = [
      {
        grade: 2,
        instrumentAllocatedTime: 10,
        xlsxrowdata: ['example'],
      },
      {
        grade: 1,
        instrumentAllocatedTime: 10,
        xlsxrowdata: ['example'],
      },
    ];

    addDecreasingInstrumentAvailTime(managementDecisionData, 10);
    expect(managementDecisionData[0].grade).toEqual(1);
  });

  test('Ensure allocated time is subtracted and added to xlsxrowdata', () => {
    const managementDecisionData = [
      {
        grade: 2,
        instrumentAllocatedTime: 1,
        xlsxrowdata: ['example', 'example', 'example'],
      },
      {
        grade: 1,
        instrumentAllocatedTime: 1,
        xlsxrowdata: ['example', 'example', 'example'],
      },
    ];

    addDecreasingInstrumentAvailTime(managementDecisionData, 100);
    expect(managementDecisionData[0].xlsxrowdata[5]).toEqual('99');
  });

  test('Ensure allocated time is limited to zero and added to xlsxrowdata', () => {
    const managementDecisionData = [
      {
        grade: 2,
        instrumentAllocatedTime: 1000,
        xlsxrowdata: ['example', 'example', 'example'],
      },
      {
        grade: 1,
        instrumentAllocatedTime: 1000,
        xlsxrowdata: ['example', 'example', 'example'],
      },
    ];

    addDecreasingInstrumentAvailTime(managementDecisionData, 100);
    expect(managementDecisionData[0].xlsxrowdata[5]).toEqual('0');
  });
});

describe('generateManagementDecisionData tests', () => {
  test('Test working basic reqquest', async () => {
    jest
      .spyOn(baseContext.queries.proposal, 'get')
      .mockResolvedValue(mockProposal);
    jest.spyOn(baseContext.queries.user, 'get').mockResolvedValue(mockUser);
    jest
      .spyOn(baseContext.queries.fap, 'getProposalFapMeetingDecisions')
      .mockResolvedValue([mockFapMeetingDecision]);

    const result = await generateManagementDecisionData(
      dummyUserWithRole,
      mockFapReview
    );

    expect(result.grade).toEqual(4.5);
    expect(result.instrumentAllocatedTime).toEqual(10);
    expect(result.xlsxrowdata).toEqual([
      '456',
      '123',
      '3',
      'Instrument A',
      'Zachary Hankin',
      '<missing>',
      '10',
      'Accepted',
      'Comment for user',
      'Comment for management',
      'FAP review comment',
    ]);
  });
});

describe('collectManagementDecisionData test', () => {
  test('Test one fap panel review generate', async () => {
    jest
      .spyOn(baseContext.queries.proposal, 'get')
      .mockResolvedValue(mockProposal);
    jest.spyOn(baseContext.queries.user, 'get').mockResolvedValue(mockUser);
    jest
      .spyOn(baseContext.queries.fap, 'getProposalFapMeetingDecisions')
      .mockResolvedValue([mockFapMeetingDecision]);

    jest
      .spyOn(baseContext.queries.fap, 'getFapReviewData')
      .mockResolvedValue([mockFapReview]);

    const result = await collectManagementDecisionData(
      1,
      1,
      dummyUserWithRole,
      1
    );

    expect(result).toEqual([
      [
        '456',
        '123',
        '3',
        'Instrument A',
        'Zachary Hankin',
        '90', //100 - 10
        '10',
        'Accepted',
        'Comment for user',
        'Comment for management',
        'FAP review comment',
      ],
    ]);
  });

  test('Test two fap panel review generate', async () => {
    jest
      .spyOn(baseContext.queries.proposal, 'get')
      .mockResolvedValue(mockProposal);
    jest.spyOn(baseContext.queries.user, 'get').mockResolvedValue(mockUser);
    jest
      .spyOn(baseContext.queries.fap, 'getProposalFapMeetingDecisions')
      .mockResolvedValue([mockFapMeetingDecision]);

    jest
      .spyOn(baseContext.queries.fap, 'getFapReviewData')
      .mockResolvedValue([mockFapReview, mockFapReview]);

    const result = await collectManagementDecisionData(
      1,
      1,
      dummyUserWithRole,
      1
    );

    expect(result).toEqual([
      [
        '456',
        '123',
        '3',
        'Instrument A',
        'Zachary Hankin',
        '90', //100 - 10
        '10',
        'Accepted',
        'Comment for user',
        'Comment for management',
        'FAP review comment',
      ],
      [
        '456',
        '123',
        '3',
        'Instrument A',
        'Zachary Hankin',
        '80', //100 - 10 - 10
        '10',
        'Accepted',
        'Comment for user',
        'Comment for management',
        'FAP review comment',
      ],
    ]);
  });
});
