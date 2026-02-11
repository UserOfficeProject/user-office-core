import { DateTime } from 'luxon';
import * as Yup from 'yup';

import {
  TZ_LESS_DATE_TIME_FORMAT,
  TYPE_ERR_INVALID_DATE,
  atOrLaterThanMsg,
} from '../util';

export const equipmentValidationSchema = Yup.object().shape({
  name: Yup.string().min(3).max(100).required(),

  maintenanceStartsAt: Yup.date()
    .nullable()
    .typeError(TYPE_ERR_INVALID_DATE)
    .notRequired(),

  maintenanceEndsAt: Yup.date()
    .nullable()
    .typeError(TYPE_ERR_INVALID_DATE)
    .when(
      'maintenanceStartsAt',
      (
        maintenanceStartsAt: Date,
        schema: Yup.DateSchema<Date | null | undefined>
      ) => {
        if (!maintenanceStartsAt) {
          return schema;
        }

        const min = DateTime.fromJSDate(maintenanceStartsAt).plus({
          minute: 1,
        });

        if (!min.isValid) {
          return schema;
        }

        return schema
          .nullable()
          .typeError(TYPE_ERR_INVALID_DATE)
          .min(
            min.toJSDate(),
            atOrLaterThanMsg(min.toFormat(TZ_LESS_DATE_TIME_FORMAT))
          )
          .notRequired();
      }
    )
    .notRequired(),
});
