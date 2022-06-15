import {
  ProposalBookingStatusCore,
  ScheduledEventBookingType,
} from '../resolvers/types/ProposalBooking';

export class ScheduledEventCore {
  constructor(
    public id: number,
    public bookingType: ScheduledEventBookingType,
    public startsAt: Date,
    public endsAt: Date,
    public proposalPk: number | null,
    public proposalBookingId: number | null,
    public status: ProposalBookingStatusCore,
    public localContactId: number | null
  ) {}
}
