import { DateTime } from 'luxon';
import * as Yup from 'yup';

import {
  TZ_LESS_DATE_TIME_FORMAT,
  TYPE_ERR_INVALID_DATE,
  atOrLaterThanMsg,
} from '../util';

export const bulkUpsertLostTimeValidationSchema = Yup.object().shape({
  proposalBookingId: Yup.number().required('ProposalBooking ID is required'),
  lostTimes: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required('LostTime ID is required'),
        startsAt: Yup.date().typeError(TYPE_ERR_INVALID_DATE).required(),

        endsAt: Yup.date()
          .typeError(TYPE_ERR_INVALID_DATE)
          .when('startsAt', (startsAt: Date) => {
            const min = DateTime.fromJSDate(startsAt).plus({ minute: 1 });

            return Yup.date().min(
              min.toJSDate(),
              atOrLaterThanMsg(min.toFormat(TZ_LESS_DATE_TIME_FORMAT))
            );
          })
          .required(),
      })
    )
    .max(50), // hard limit
});
