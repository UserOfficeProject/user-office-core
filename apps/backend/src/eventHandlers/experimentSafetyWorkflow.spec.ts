import { container } from 'tsyringe';

import { Tokens } from '../config/Tokens';
import { StatusDataSourceMock } from '../datasources/mockups/StatusDataSource';
import * as eventBusModule from '../events';
import { ApplicationEvent } from '../events/applicationEvents';
import { Event } from '../events/event.enum';
import * as workflowEngineModule from '../workflowEngine/experiment';
import { WorkflowEngineExperimentType } from '../workflowEngine/experiment';
import createExperimentSafetyWorkflowHandler, {
  handleWorkflowEngineChange,
} from './experimentSafetyWorkflow';

const mockPublish = jest.fn();

let spyMarkEvent: jest.SpyInstance;
let spyResolveEventBus: jest.SpyInstance;
let mockStatusDataSource: StatusDataSourceMock;

beforeAll(() => {
  spyMarkEvent = jest
    .spyOn(
      workflowEngineModule,
      'markExperimentSafetyEventAsDoneAndCallWorkflowEngine'
    )
    .mockResolvedValue([]);

  spyResolveEventBus = jest
    .spyOn(eventBusModule, 'resolveApplicationEventBus')
    .mockReturnValue({ publish: mockPublish } as any);
});

afterAll(() => {
  spyMarkEvent.mockRestore();
  spyResolveEventBus.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();

  spyMarkEvent.mockResolvedValue([]);
  spyResolveEventBus.mockReturnValue({ publish: mockPublish } as any);

  mockStatusDataSource = container.resolve(Tokens.StatusDataSource);
  jest.spyOn(mockStatusDataSource, 'getStatus');
});

const createMockEvent = (
  overrides: Partial<ApplicationEvent> = {}
): ApplicationEvent =>
  ({
    type: Event.EXPERIMENT_CREATED,
    isRejection: false,
    blockWorkflow: false,
    key: 'experiment',
    loggedInUserId: null,
    experiment: { experimentPk: 42 },
    ...overrides,
  }) as unknown as ApplicationEvent;

const createMockUpdatedExperiment = (
  overrides: Partial<WorkflowEngineExperimentType> = {}
): WorkflowEngineExperimentType =>
  ({
    experimentSafetyPk: 1,
    experimentPk: 42,
    statusId: 10,
    prevStatusId: 5,
    workflowId: 1,
    callShortCode: 'CALL-1',
    ...overrides,
  }) as WorkflowEngineExperimentType;

describe('experimentSafetyWorkflowHandler', () => {
  describe('Early exit conditions', () => {
    test('should return early if event.isRejection is true', async () => {
      const handler = createExperimentSafetyWorkflowHandler();
      const event = createMockEvent({ isRejection: true });

      await handler(event);

      expect(spyMarkEvent).not.toHaveBeenCalled();
    });

    test('should return early if event.blockWorkflow is true', async () => {
      const handler = createExperimentSafetyWorkflowHandler();
      const event = createMockEvent({ blockWorkflow: true });

      await handler(event);

      expect(spyMarkEvent).not.toHaveBeenCalled();
    });

    test('should return early if event has no experimentPk anywhere', async () => {
      const handler = createExperimentSafetyWorkflowHandler();
      const event = {
        type: Event.PROPOSAL_CREATED,
        isRejection: false,
        blockWorkflow: false,
        key: 'proposal',
        loggedInUserId: null,
        proposal: { proposalPk: 1, title: 'Test Proposal' },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(spyMarkEvent).not.toHaveBeenCalled();
    });
  });

  describe('Extracting experimentPk from events', () => {
    test('should find experimentPk in a flat event object (e.g., experiment key)', async () => {
      const handler = createExperimentSafetyWorkflowHandler();
      const event = createMockEvent({
        type: Event.EXPERIMENT_CREATED,
        experiment: { experimentPk: 100 },
      } as unknown as Partial<ApplicationEvent>);

      await handler(event);

      expect(spyMarkEvent).toHaveBeenCalledWith(Event.EXPERIMENT_CREATED, [
        100,
      ]);
    });

    test('should find experimentPk in a nested object (e.g., experimentsafety)', async () => {
      const handler = createExperimentSafetyWorkflowHandler();
      const event = {
        type: Event.EXPERIMENT_ESF_SUBMITTED,
        isRejection: false,
        blockWorkflow: false,
        key: 'experimentsafety',
        loggedInUserId: null,
        experimentsafety: { experimentPk: 77, experimentSafetyPk: 1 },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(spyMarkEvent).toHaveBeenCalledWith(
        Event.EXPERIMENT_ESF_SUBMITTED,
        [77]
      );
    });
  });

  describe('Non-experiment events are ignored', () => {
    test('should not call workflow engine for events with no experiment info', async () => {
      const handler = createExperimentSafetyWorkflowHandler();
      const event = {
        type: Event.PROPOSAL_UPDATED,
        isRejection: false,
        blockWorkflow: false,
        key: 'proposal',
        loggedInUserId: null,
        proposal: { proposalPk: 5, title: 'Another' },
      } as unknown as ApplicationEvent;

      await handler(event);

      expect(spyMarkEvent).not.toHaveBeenCalled();
    });
  });
});

describe('handleWorkflowEngineChange', () => {
  test('should wrap a single pk into an array and call workflow engine', async () => {
    const event = createMockEvent({ type: Event.EXPERIMENT_CREATED });

    await handleWorkflowEngineChange(event, 42);

    expect(spyMarkEvent).toHaveBeenCalledWith(Event.EXPERIMENT_CREATED, [42]);
  });

  test('should pass an array of pks directly to workflow engine', async () => {
    const event = createMockEvent({ type: Event.EXPERIMENT_UPDATED });

    await handleWorkflowEngineChange(event, [10, 20, 30]);

    expect(spyMarkEvent).toHaveBeenCalledWith(
      Event.EXPERIMENT_UPDATED,
      [10, 20, 30]
    );
  });

  describe('publishExperimentSafetyStatusChange', () => {
    test('should publish status change events when workflow engine returns updated experiments', async () => {
      const event = createMockEvent({ type: Event.EXPERIMENT_CREATED });
      const updatedExperiment = createMockUpdatedExperiment({
        statusId: 10,
        prevStatusId: 5,
      });

      spyMarkEvent.mockResolvedValue([updatedExperiment]);

      jest
        .spyOn(mockStatusDataSource, 'getStatus')
        .mockResolvedValueOnce({ name: 'Approved' } as any) // new statusId (called first)
        .mockResolvedValueOnce({ name: 'Draft' } as any); // prevStatusId (called second)

      await handleWorkflowEngineChange(event, 42);

      await new Promise(process.nextTick);

      expect(mockPublish).toHaveBeenCalledWith(
        expect.objectContaining({
          type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_WORKFLOW,
          experimentsafety: updatedExperiment,
          isRejection: false,
        })
      );
    });

    test('should NOT publish status change when event type is EXPERIMENT_SAFETY_STATUS_CHANGED_BY_USER', async () => {
      const event = createMockEvent({
        type: Event.EXPERIMENT_SAFETY_STATUS_CHANGED_BY_USER,
        experimentsafety: { experimentPk: 42 },
      } as unknown as Partial<ApplicationEvent>);

      const updatedExperiment = createMockUpdatedExperiment();
      spyMarkEvent.mockResolvedValue([updatedExperiment]);

      await handleWorkflowEngineChange(event, 42);
      await new Promise(process.nextTick);

      expect(mockPublish).not.toHaveBeenCalled();
    });

    test('should not publish if workflow engine returns an empty array', async () => {
      const event = createMockEvent({ type: Event.EXPERIMENT_CREATED });
      spyMarkEvent.mockResolvedValue([]);

      await handleWorkflowEngineChange(event, 42);
      await new Promise(process.nextTick);

      expect(mockPublish).not.toHaveBeenCalled();
    });

    test('should not publish if updated experiment has no statusId', async () => {
      const event = createMockEvent({ type: Event.EXPERIMENT_CREATED });
      const updatedExperiment = createMockUpdatedExperiment({
        statusId: undefined as unknown as number,
      });

      spyMarkEvent.mockResolvedValue([updatedExperiment]);

      await handleWorkflowEngineChange(event, 42);
      await new Promise(process.nextTick);

      expect(mockPublish).not.toHaveBeenCalled();
    });

    test('should not publish if workflow engine returns null', async () => {
      const event = createMockEvent({ type: Event.EXPERIMENT_CREATED });
      spyMarkEvent.mockResolvedValue(null);

      await handleWorkflowEngineChange(event, 42);
      await new Promise(process.nextTick);

      expect(mockPublish).not.toHaveBeenCalled();
    });
  });
});
