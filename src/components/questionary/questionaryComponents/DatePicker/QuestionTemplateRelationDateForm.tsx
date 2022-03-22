import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import { DatePicker, DateTimePicker } from 'formik-mui-lab';
import { DateTime } from 'luxon';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { DateConfig } from 'generated/sdk';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationDateForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  const theme = useTheme();

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({})}
    >
      {(formikProps) => {
        const { minDate, maxDate, defaultDate, includeTime } = formikProps
          .values.config as DateConfig;

        const defaultFieldMinDate = minDate
          ? DateTime.fromISO(minDate).startOf(includeTime ? 'minute' : 'day')
          : null;
        const defaultFieldMaxDate = maxDate
          ? DateTime.fromISO(maxDate).startOf(includeTime ? 'minute' : 'day')
          : null;
        const defaultFieldDate = defaultDate
          ? DateTime.fromISO(defaultDate).startOf(
              includeTime ? 'minute' : 'day'
            )
          : null;

        const isDefaultDateBeforeMinDate =
          defaultFieldDate &&
          defaultFieldMinDate &&
          defaultFieldMinDate > defaultFieldDate;
        const isDefaultDateAfterMaxDate =
          defaultFieldDate &&
          defaultFieldMaxDate &&
          defaultFieldMaxDate < defaultFieldDate;

        const isMinDateAfterMaxDate =
          defaultFieldMinDate &&
          defaultFieldMaxDate &&
          defaultFieldMinDate > defaultFieldMaxDate;

        if (formikProps.isValid) {
          if (isDefaultDateBeforeMinDate) {
            formikProps.setFieldError(
              'config.defaultDate',
              'Default should be after "Min" date'
            );
          }
          if (isDefaultDateAfterMaxDate) {
            formikProps.setFieldError(
              'config.defaultDate',
              'Default should be before "Max" date'
            );
          }
          if (isMinDateAfterMaxDate) {
            formikProps.setFieldError(
              'config.minDate',
              '"Min" date should be before "Max" date'
            );
          }
        }

        const component = includeTime ? DateTimePicker : DatePicker;
        const inputFormat = includeTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd';

        return (
          <>
            <QuestionExcerpt question={props.questionRel.question} />
            <Field
              name="config.includeTime"
              label="Include time"
              component={FormikUICustomCheckbox}
              fullWidth
              inputProps={{ 'data-cy': 'includeTime' }}
            />
            <Field
              name="config.tooltip"
              label="Tooltip"
              id="tooltip-input"
              type="text"
              component={TextField}
              fullWidth
              data-cy="tooltip"
            />
            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                label="Is required"
                component={FormikUICustomCheckbox}
                fullWidth
                data-cy="required"
              />

              <LocalizationProvider dateAdapter={DateAdapter}>
                <Field
                  name="config.minDate"
                  label="Min"
                  id="Min-input"
                  ampm={false}
                  inputFormat={inputFormat}
                  component={component}
                  maxDate={defaultFieldMaxDate}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'minDate',
                  }}
                  desktopModeMediaQuery={theme.breakpoints.up('sm')}
                />
                <Field
                  name="config.maxDate"
                  label="Max"
                  id="Max-input"
                  ampm={false}
                  inputFormat={inputFormat}
                  component={component}
                  minDate={defaultFieldMinDate}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'maxDate',
                  }}
                  desktopModeMediaQuery={theme.breakpoints.up('sm')}
                />
                <Field
                  name="config.defaultDate"
                  label="Default"
                  id="Default-input"
                  ampm={false}
                  inputFormat={inputFormat}
                  component={component}
                  minDate={defaultFieldMinDate}
                  maxDate={defaultFieldMaxDate}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'defaultDate',
                  }}
                  desktopModeMediaQuery={theme.breakpoints.up('sm')}
                />
              </LocalizationProvider>
            </TitledContainer>
            <TitledContainer label="Dependencies">
              <QuestionDependencyList
                form={formikProps}
                template={props.template}
              />
            </TitledContainer>
          </>
        );
      }}
    </QuestionTemplateRelationFormShell>
  );
};
