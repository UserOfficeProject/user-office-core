import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { ExperimentDataSourceMock } from '../datasources/mockups/ExperimentDataSource';
import * as eventBusModule from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import { ExperimentSafety } from '../models/Experiment';
import { WorkflowEngine, WorkflowEngineType } from '../workflowEngine';
import experimentSafetyWorkflowEntity from './workflowEntities/experiment';
import * as statusActionEngineModule from './workflowEntities/experiment/statusActionEngine';
import proposalWorkflowEntity from './workflowEntities/proposal';
import workflowHandler, { startWorkflow } from './workflowHandler';

const createProposalEvent = (
  overrides: Record<string, unknown> = {}
): ApplicationEvent =>
  ({
    type: Event.PROPOSAL_CREATED,
    isRejection: false,
    key: 'proposal',
    loggedInUserId: null,
    proposal: { primaryKey: 1, title: 'Test proposal' },
    ...overrides,
  }) as unknown as ApplicationEvent;

const createExperimentSafetyEvent = (
  overrides: Record<string, unknown> = {}
): ApplicationEvent =>
  ({
    type: Event.EXPERIMENT_ESF_SUBMITTED,
    isRejection: false,
    key: 'experimentsafety',
    loggedInUserId: null,
    experimentsafety: { experimentSafetyPk: 42, experimentPk: 1 },
    ...overrides,
  }) as unknown as ApplicationEvent;

const createUpdatedEntity = (
  overrides: Partial<WorkflowEngineType> = {}
): WorkflowEngineType => ({
  entityId: 1,
  prevStatusId: 1,
  nextStatusId: 2,
  workflowStatusConnectionId: 1,
  ...overrides,
});

let runSpy: jest.SpyInstance;
let proposalStatusChangeSpy: jest.SpyInstance;
let experimentStatusChangeSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();

  runSpy = jest.spyOn(WorkflowEngine.prototype, 'run').mockResolvedValue([]);
  proposalStatusChangeSpy = jest
    .spyOn(proposalWorkflowEntity, 'onWorkflowStatusChange')
    .mockResolvedValue();
  experimentStatusChangeSpy = jest
    .spyOn(experimentSafetyWorkflowEntity, 'onWorkflowStatusChange')
    .mockResolvedValue();
});

afterEach(() => {
  runSpy.mockRestore();
  proposalStatusChangeSpy.mockRestore();
  experimentStatusChangeSpy.mockRestore();
});

describe('workflowHandler', () => {
  describe('Early exit conditions', () => {
    test('should return early if event.isRejection is true', async () => {
      const handler = workflowHandler();
      const event = createProposalEvent({ isRejection: true });

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should not start any workflow if event has no matching entity keys', async () => {
      const handler = workflowHandler();
      const event = {
        type: Event.CALL_CREATED,
        isRejection: false,
        key: 'call',
        loggedInUserId: null,
        call: { callId: 1, shortCode: 'CALL-1' },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('Extracting proposal entity from events', () => {
    test('should start proposal workflow when event contains primaryKey', async () => {
      const handler = workflowHandler();
      const event = createProposalEvent({
        proposal: { primaryKey: 100, title: 'Test proposal' },
      });

      await handler(event);

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.PROPOSAL_CREATED, entities: [100] },
        proposalWorkflowEntity
      );
    });

    test('should start proposal workflow when event contains proposalPk in a nested object', async () => {
      const handler = workflowHandler();
      const event = {
        type: Event.PROPOSAL_FAP_MEETING_SAVED,
        isRejection: false,
        key: 'fapmeetingdecision',
        loggedInUserId: null,
        fapmeetingdecision: { proposalPk: 7, submitted: true },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.PROPOSAL_FAP_MEETING_SAVED, entities: [7] },
        proposalWorkflowEntity
      );
    });

    test('should start proposal workflow with multiple entities when event contains proposalPks array', async () => {
      const handler = workflowHandler();
      const event = {
        type: Event.PROPOSAL_STATUS_CHANGED_BY_USER,
        isRejection: false,
        key: 'proposalpks',
        loggedInUserId: null,
        proposalpks: { proposalPks: [1, 2, 3] },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.PROPOSAL_STATUS_CHANGED_BY_USER, entities: [1, 2, 3] },
        proposalWorkflowEntity
      );
    });

    test('should prefer primaryKey over proposalPks when both are present', async () => {
      const handler = workflowHandler();
      const event = createProposalEvent({
        proposal: { primaryKey: 5, proposalPks: [8, 9] },
      });

      await handler(event);

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.PROPOSAL_CREATED, entities: [5] },
        proposalWorkflowEntity
      );
    });
  });

  describe('Extracting experiment safety entity from events', () => {
    test('should start experiment safety workflow when event contains experimentSafetyPk', async () => {
      const handler = workflowHandler();
      const event = createExperimentSafetyEvent({
        experimentsafety: { experimentSafetyPk: 42, experimentPk: 1 },
      });

      await handler(event);

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.EXPERIMENT_ESF_SUBMITTED, entities: [42] },
        experimentSafetyWorkflowEntity
      );
    });

    test('should not start experiment safety workflow for events without experimentSafetyPk', async () => {
      const handler = workflowHandler();
      const event = {
        type: Event.EXPERIMENT_ESF_SUBMITTED,
        isRejection: false,
        key: 'experimentsafety',
        loggedInUserId: null,
        experimentsafety: { experimentPk: 1 },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('Handling events for multiple entities', () => {
    test('should start workflows for both entities when event contains keys for both', async () => {
      const handler = workflowHandler();
      const event = createExperimentSafetyEvent({
        proposal: { primaryKey: 3 },
      });

      await handler(event);

      expect(runSpy).toHaveBeenCalledTimes(2);
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.EXPERIMENT_ESF_SUBMITTED, entities: [3] },
        proposalWorkflowEntity
      );
      expect(runSpy).toHaveBeenCalledWith(
        { event: Event.EXPERIMENT_ESF_SUBMITTED, entities: [42] },
        experimentSafetyWorkflowEntity
      );
    });
  });

  describe('Exempted events', () => {
    test('should not start proposal workflow for exempted PROPOSAL_DELETED event', async () => {
      const handler = workflowHandler();
      const event = createProposalEvent({ type: Event.PROPOSAL_DELETED });

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });
  });

  describe('Invalid entity identifier values', () => {
    test('should not start workflow when entity identifier is not a number', async () => {
      const handler = workflowHandler();
      const event = createProposalEvent({
        proposal: { primaryKey: 'not-a-number' },
      });

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should not start workflow when entity identifier array is empty', async () => {
      const handler = workflowHandler();
      const event = {
        type: Event.PROPOSAL_STATUS_CHANGED_BY_USER,
        isRejection: false,
        key: 'proposalpks',
        loggedInUserId: null,
        proposalpks: { proposalPks: [] },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should not start workflow when entity identifier array contains non-numbers', async () => {
      const handler = workflowHandler();
      const event = {
        type: Event.PROPOSAL_STATUS_CHANGED_BY_USER,
        isRejection: false,
        key: 'proposalpks',
        loggedInUserId: null,
        proposalpks: { proposalPks: ['1', '2'] },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });

    test('should not start workflow when entity identifier is null', async () => {
      const handler = workflowHandler();
      const event = createProposalEvent({
        proposal: { primaryKey: null },
      });

      await handler(event);

      expect(runSpy).not.toHaveBeenCalled();
    });
  });
});

describe('startWorkflow', () => {
  test('should wrap a single entity identifier into an array and call the workflow engine', async () => {
    const event = createProposalEvent();

    await startWorkflow(event, 42, proposalWorkflowEntity);

    expect(runSpy).toHaveBeenCalledWith(
      { event: Event.PROPOSAL_CREATED, entities: [42] },
      proposalWorkflowEntity
    );
  });

  test('should pass an array of entity identifiers to the workflow engine as is', async () => {
    const event = createProposalEvent();

    await startWorkflow(event, [1, 2, 3], proposalWorkflowEntity);

    expect(runSpy).toHaveBeenCalledWith(
      { event: Event.PROPOSAL_CREATED, entities: [1, 2, 3] },
      proposalWorkflowEntity
    );
  });

  test('should call onWorkflowStatusChange with the updated entities and return them', async () => {
    const event = createExperimentSafetyEvent();
    const updatedEntities = [createUpdatedEntity({ entityId: 42 })];
    runSpy.mockResolvedValue(updatedEntities);

    const result = await startWorkflow(
      event,
      42,
      experimentSafetyWorkflowEntity
    );

    expect(experimentStatusChangeSpy).toHaveBeenCalledWith(updatedEntities);
    expect(result).toEqual(updatedEntities);
  });

  test('should not call onWorkflowStatusChange when no statuses changed', async () => {
    const event = createProposalEvent();
    runSpy.mockResolvedValue([]);

    const result = await startWorkflow(event, 1, proposalWorkflowEntity);

    expect(proposalStatusChangeSpy).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });
});

describe('experimentSafetyWorkflowEntity.onWorkflowStatusChange', () => {
  const mockPublish = jest.fn();
  let eventBusSpy: jest.SpyInstance;
  let getExperimentSafetySpy: jest.SpyInstance;
  let statusActionEngineSpy: jest.SpyInstance;
  let experimentDataSource: ExperimentDataSourceMock;

  const dummyExperimentSafety = {
    experimentSafetyPk: 42,
    experimentPk: 1,
    workflowStatusId: 2,
  } as ExperimentSafety;

  beforeEach(() => {
    experimentStatusChangeSpy.mockRestore();

    eventBusSpy = jest
      .spyOn(eventBusModule, 'resolveApplicationEventBus')
      .mockReturnValue({ publish: mockPublish } as never);

    statusActionEngineSpy = jest
      .spyOn(statusActionEngineModule, 'experimentSafetyStatusActionEngine')
      .mockResolvedValue(undefined);

    experimentDataSource = container.resolve(Tokens.ExperimentDataSource);
    getExperimentSafetySpy = jest.spyOn(
      experimentDataSource,
      'getExperimentSafety'
    );
  });

  afterEach(() => {
    eventBusSpy.mockRestore();
    statusActionEngineSpy.mockRestore();
    getExperimentSafetySpy.mockRestore();
  });

  test('should publish status change event when the experiment safety is found', async () => {
    getExperimentSafetySpy.mockResolvedValue(dummyExperimentSafety);

    await experimentSafetyWorkflowEntity.onWorkflowStatusChange([
      createUpdatedEntity({ entityId: 42 }),
    ]);

    expect(mockPublish).toHaveBeenCalledTimes(1);
    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
        experimentsafety: dummyExperimentSafety,
        isRejection: false,
        key: 'experimentsafety',
      })
    );
    expect(statusActionEngineSpy).toHaveBeenCalledWith([
      {
        experimentSafety: dummyExperimentSafety,
        workflowStatusConnectionId: 1,
      },
    ]);
  });

  test('should not publish status change event when the experiment safety is not found', async () => {
    getExperimentSafetySpy.mockResolvedValue(null);

    await experimentSafetyWorkflowEntity.onWorkflowStatusChange([
      createUpdatedEntity({ entityId: 9999 }),
    ]);

    expect(mockPublish).not.toHaveBeenCalled();
    expect(statusActionEngineSpy).not.toHaveBeenCalled();
  });

  test('should not publish anything when there are no updated entities', async () => {
    await experimentSafetyWorkflowEntity.onWorkflowStatusChange([]);

    expect(mockPublish).not.toHaveBeenCalled();
    expect(statusActionEngineSpy).not.toHaveBeenCalled();
  });
});
