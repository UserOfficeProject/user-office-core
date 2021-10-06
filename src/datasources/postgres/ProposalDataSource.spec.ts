/* eslint-disable quotes */
import 'reflect-metadata';
import * as faker from 'faker';
import { container } from 'tsyringe';

import {
  ProposalBookingStatus,
  ScheduledEventBookingType,
} from '../../resolvers/types/ProposalBooking';
import ProposalDataSource, {
  calculateReferenceNumber,
} from './ProposalDataSource';

const proposalDataSource = container.resolve(ProposalDataSource);

const eventId = faker.datatype.number(1000);

describe('Reference number calculation', () => {
  test('An error is thrown when there is no prefix in the format', async () => {
    return expect(calculateReferenceNumber('{digits:4}', 0)).rejects.toThrow(
      'invalid'
    );
  });

  test('An error is thrown when there are no parameters in the format', async () => {
    return expect(calculateReferenceNumber('211', 0)).rejects.toThrow(
      'invalid'
    );
  });

  test('An error is thrown when the sequence provided exceeds the digits parameter', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}', 12345)
    ).rejects.toThrow("exceeds the format's digits parameter");
  });

  test('A reference number is calculated when there is only a prefix and digits parameter in the format', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}', 5)
    ).resolves.toEqual('2110005');
  });

  test('0 (zero) is used as a sequence number when one is not provided', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}', null)
    ).resolves.toEqual('2110000');
  });

  test('A reference number is calculated when there is a prefix and multiple parameters including digits in the format', async () => {
    return expect(
      calculateReferenceNumber('211{digits:4}{other:param}', null)
    ).resolves.toEqual('2110000');
  });

  test('The sequence is padded according to the digits parameter', async () => {
    return expect(
      calculateReferenceNumber('211{digits:7}', 1015)
    ).resolves.toEqual('2110001015');
  });

  test('Add proposal scheduled event', async () => {
    const scheduledEventToAdd = {
      id: eventId,
      bookingType: ScheduledEventBookingType.USER_OPERATIONS,
      startsAt: new Date('2021-10-06 13:00:00'),
      endsAt: new Date('2021-10-07 13:00:00'),
      proposalBookingId: 1,
      proposalPk: 1,
      status: ProposalBookingStatus.DRAFT,
    };

    await proposalDataSource.addProposalBookingScheduledEvent(
      scheduledEventToAdd
    );

    const scheduledEvents = proposalDataSource.proposalBookingScheduledEvents(
      1,
      {
        bookingType: ScheduledEventBookingType.USER_OPERATIONS,
        status: [ProposalBookingStatus.DRAFT],
      }
    );

    return expect(scheduledEvents).resolves.toEqual(
      expect.arrayContaining([scheduledEventToAdd])
    );
  });

  test('Update proposal scheduled event ending time', async () => {
    const scheduledEventToUpdate = {
      id: eventId,
      bookingType: ScheduledEventBookingType.USER_OPERATIONS,
      startsAt: new Date('2021-10-06 13:00:00'),
      endsAt: new Date('2021-10-07 14:00:00'),
      proposalBookingId: 1,
      proposalPk: 1,
      status: ProposalBookingStatus.DRAFT,
    };

    await proposalDataSource.updateProposalBookingScheduledEvent(
      scheduledEventToUpdate
    );

    const scheduledEvents = proposalDataSource.proposalBookingScheduledEvents(
      1,
      {
        bookingType: ScheduledEventBookingType.USER_OPERATIONS,
        status: [ProposalBookingStatus.DRAFT],
      }
    );

    return expect(scheduledEvents).resolves.toEqual(
      expect.arrayContaining([scheduledEventToUpdate])
    );
  });

  test('Update proposal scheduled event status', async () => {
    const scheduledEventToUpdate = {
      id: eventId,
      bookingType: ScheduledEventBookingType.USER_OPERATIONS,
      startsAt: new Date('2021-10-06 13:00:00'),
      endsAt: new Date('2021-10-07 14:00:00'),
      proposalBookingId: 1,
      proposalPk: 1,
      status: ProposalBookingStatus.ACTIVE,
    };

    await proposalDataSource.updateProposalBookingScheduledEvent(
      scheduledEventToUpdate
    );

    const draftScheduledEvents =
      proposalDataSource.proposalBookingScheduledEvents(1, {
        bookingType: ScheduledEventBookingType.USER_OPERATIONS,
        status: [ProposalBookingStatus.DRAFT],
      });

    await expect(draftScheduledEvents).resolves.toEqual(
      expect.not.arrayContaining([scheduledEventToUpdate])
    );

    const activeScheduledEvents =
      proposalDataSource.proposalBookingScheduledEvents(1, {
        bookingType: ScheduledEventBookingType.USER_OPERATIONS,
        status: [ProposalBookingStatus.DRAFT],
      });

    return expect(activeScheduledEvents).resolves.toEqual(
      expect.not.arrayContaining([scheduledEventToUpdate])
    );
  });

  test('Remove proposal scheduled event', async () => {
    const scheduledEventsToRemove = [
      {
        id: eventId,
        bookingType: ScheduledEventBookingType.USER_OPERATIONS,
        startsAt: new Date('2021-10-06 13:00:00'),
        endsAt: new Date('2021-10-07 14:00:00'),
        proposalBookingId: 1,
        proposalPk: 1,
        status: ProposalBookingStatus.DRAFT,
      },
    ];

    await proposalDataSource.removeProposalBookingScheduledEvents(
      scheduledEventsToRemove
    );

    const scheduledEvents = proposalDataSource.proposalBookingScheduledEvents(
      1,
      {
        bookingType: ScheduledEventBookingType.USER_OPERATIONS,
        status: [ProposalBookingStatus.DRAFT],
      }
    );

    return expect(scheduledEvents).resolves.toEqual(
      expect.not.arrayContaining(scheduledEventsToRemove)
    );
  });
});
