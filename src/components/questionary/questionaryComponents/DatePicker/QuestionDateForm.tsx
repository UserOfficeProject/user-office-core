import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import { DatePicker, DateTimePicker } from 'formik-mui-lab';
import React, { FC, useContext } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SettingsContext } from 'context/SettingsContextProvider';
import { DateConfig, SettingsId } from 'generated/sdk';
import { minMaxDateTimeCalculations } from 'utils/Time';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionDateForm: FC<QuestionFormProps> = (props) => {
  const theme = useTheme();
  const { settings } = useContext(SettingsContext);

  const dateTimeFormat = settings.get(
    SettingsId.DATE_TIME_FORMAT
  )?.settingsValue;
  const dateFormat = settings.get(SettingsId.DATE_FORMAT)?.settingsValue;
  const field = props.question;

  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
      })}
    >
      {(formikProps) => {
        const { minDate, maxDate, defaultDate, includeTime } = formikProps
          .values.config as DateConfig;

        const {
          defaultFieldMaxDate,
          defaultFieldMinDate,
          isDefaultAfterMaxDate,
          isDefaultBeforeMinDate,
          isMinAfterMaxDate,
        } = minMaxDateTimeCalculations({
          minDate,
          maxDate,
          defaultDate,
          includeTime,
        });

        if (formikProps.isValid) {
          if (isDefaultBeforeMinDate) {
            formikProps.setFieldError(
              'config.defaultDate',
              'Default should be after "Min" date'
            );
          }
          if (isDefaultAfterMaxDate) {
            formikProps.setFieldError(
              'config.defaultDate',
              'Default should be before "Max" date'
            );
          }
          if (isMinAfterMaxDate) {
            formikProps.setFieldError(
              'config.minDate',
              '"Min" date should be before "Max" date'
            );
          }
        }

        const component = includeTime ? DateTimePicker : DatePicker;
        const inputFormat = includeTime ? dateTimeFormat : dateFormat;
        const mask = inputFormat?.replace(/[a-zA-Z]/g, '_');

        return (
          <>
            <Field
              name="naturalKey"
              label="Key"
              id="Key-Input"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'natural_key' }}
            />
            <Field
              name="question"
              label="Question"
              id="Question-Input"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'question' }}
            />
            <Field
              name="config.includeTime"
              id="Include-time-Input"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Include time',
              }}
              inputProps={{ 'data-cy': 'includeTime' }}
            />
            <Field
              name="config.tooltip"
              id="Tooltip-Input"
              label="Tooltip"
              type="text"
              component={TextField}
              fullWidth
              inputProps={{ 'data-cy': 'tooltip' }}
            />

            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                id="Is-Required-Input"
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Is required',
                }}
                data-cy="required"
              />
              <LocalizationProvider dateAdapter={DateAdapter}>
                <Field
                  name="config.minDate"
                  id="Min-Time-Input"
                  label="Min"
                  inputFormat={inputFormat}
                  mask={mask}
                  ampm={false}
                  component={component}
                  showToolbar
                  inputProps={{ placeholder: inputFormat }}
                  maxDate={defaultFieldMaxDate}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'minDate',
                  }}
                  desktopModeMediaQuery={theme.breakpoints.up('sm')}
                />
                <Field
                  name="config.maxDate"
                  id="Max-Time-Input"
                  label="Max"
                  inputFormat={inputFormat}
                  mask={mask}
                  ampm={false}
                  component={component}
                  inputProps={{ placeholder: inputFormat }}
                  minDate={defaultFieldMinDate}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'maxDate',
                  }}
                  desktopModeMediaQuery={theme.breakpoints.up('sm')}
                />
                <Field
                  name="config.defaultDate"
                  id="Default-Time-Input"
                  label="Default"
                  inputFormat={inputFormat}
                  mask={mask}
                  ampm={false}
                  component={component}
                  inputProps={{ placeholder: inputFormat }}
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
          </>
        );
      }}
    </QuestionFormShell>
  );
};
