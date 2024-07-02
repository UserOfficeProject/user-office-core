import { AllocationTimeUnits, Call } from '../../models/Call';
import { CallHasInstrument } from '../../models/CallHasInstrument';
import { CreateCallInput } from '../../resolvers/mutations/CreateCallMutation';
import {
  AssignInstrumentsToCallInput,
  RemoveAssignedInstrumentFromCallInput,
  UpdateCallInput,
  UpdateFapToCallInstrumentInput,
} from '../../resolvers/mutations/UpdateCallMutation';
import { CallDataSource } from '../CallDataSource';
import { CallsFilter } from './../../resolvers/queries/CallsQuery';

export const dummyCallFactory = (values?: Partial<Call>) => {
  return new Call(
    values?.id || 1,
    values?.shortCode || 'shortCode',
    values?.startCall || new Date(),
    values?.endCall || new Date(),
    values?.endCallInternal || new Date(),
    values?.startReview || new Date(),
    values?.endReview || new Date(),
    values?.startFapReview || new Date(),
    values?.endFapReview || new Date(),
    values?.startNotify || new Date(),
    values?.endNotify || new Date(),
    values?.startCycle || new Date(),
    values?.endCycle || new Date(),
    values?.cycleComment || 'Cycle comment',
    values?.surveyComment || 'Survey comment',
    values?.submissionMessage || 'Submission message',
    values?.referenceNumberFormat || '',
    values?.proposalSequence || 0,
    values?.proposalWorkflowId || 1,
    values?.callEnded || false,
    values?.callEndedInternal || false,
    values?.callReviewEnded || false,
    values?.callFapReviewEnded || false,
    values?.templateId || 1,
    values?.esiTemplateId || 2,
    values?.allocationTimeUnit || AllocationTimeUnits.Day,
    values?.title || 'Title',
    values?.description || 'Description',
    values?.pdfTemplateId || 1,
    values?.isActive || true,
    values?.needTechReview || true
  );
};

export const dummyCall = new Call(
  1,
  'shortCode',
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  '',
  '',
  '',
  '',
  0,
  1,
  false,
  false,
  false,
  false,
  1,
  2,
  AllocationTimeUnits.Day,
  '',
  '',
  1,
  true,
  true
);

export const anotherDummyCall = new Call(
  2,
  'shortCode2',
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  new Date('2019-07-17 08:25:12.23043+00'),
  '',
  '',
  '',
  '',
  0,
  1,
  true,
  false,
  false,
  false,
  1,
  2,
  AllocationTimeUnits.Day,
  '',
  '',
  1,
  true,
  true
);

export const dummyCalls = [dummyCall, anotherDummyCall];

export class CallDataSourceMock implements CallDataSource {
  async delete(id: number): Promise<Call> {
    return dummyCall;
  }
  async getCall(id: number): Promise<Call | null> {
    const call = dummyCalls.find((dummyCallItem) => dummyCallItem.id === id);

    if (call) {
      return call;
    } else {
      return null;
    }
  }

  async getCalls(filter?: CallsFilter): Promise<Call[]> {
    if (filter?.isReviewEnded === false) {
      return dummyCalls.filter(
        (dummyCallItem) => !dummyCallItem.callReviewEnded
      );
    }

    if (filter?.isEnded === false) {
      return dummyCalls.filter((dummyCallItem) => !dummyCallItem.callEnded);
    }

    return dummyCalls;
  }

  async getCallHasInstrumentsByInstrumentIds(
    instrumentIds: number[]
  ): Promise<CallHasInstrument[]> {
    throw new Error('Method not implemented.');
  }

  async create(args: CreateCallInput) {
    return { ...dummyCall, ...args };
  }

  async update(args: UpdateCallInput) {
    const indexOfCallToUpdate = dummyCalls.indexOf(dummyCall);

    dummyCalls[indexOfCallToUpdate] = { ...dummyCall, ...args };

    return dummyCalls[indexOfCallToUpdate];
  }

  async assignInstrumentsToCall(args: AssignInstrumentsToCallInput) {
    return dummyCall;
  }

  async updateFapToCallInstrument(args: UpdateFapToCallInstrumentInput) {
    return dummyCall;
  }

  async removeAssignedInstrumentFromCall(
    args: RemoveAssignedInstrumentFromCallInput
  ) {
    return dummyCall;
  }

  async getCallsByInstrumentScientist(scientistId: number): Promise<Call[]> {
    return dummyCalls;
  }

  async isCallEnded(callId: number): Promise<boolean> {
    return callId !== 1;
  }
}
