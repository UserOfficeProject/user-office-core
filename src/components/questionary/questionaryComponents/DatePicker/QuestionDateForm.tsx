import DateAdapter from '@mui/lab/AdapterLuxon';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import useTheme from '@mui/material/styles/useTheme';
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import { DatePicker } from 'formik-mui-lab';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionDateForm: FC<QuestionFormProps> = (props) => {
  const theme = useTheme();
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
      {() => (
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
            label="Include time"
            component={FormikUICustomCheckbox}
            fullWidth
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
              label="Is required"
              component={FormikUICustomCheckbox}
              fullWidth
              data-cy="required"
            />
            <LocalizationProvider dateAdapter={DateAdapter}>
              <Field
                name="config.minDate"
                id="Min-Time-Input"
                label="Min"
                inputFormat="yyyy-MM-dd"
                component={DatePicker}
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
                inputFormat="yyyy-MM-dd"
                component={DatePicker}
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
                inputFormat="yyyy-MM-dd"
                component={DatePicker}
                textField={{
                  fullWidth: true,
                  'data-cy': 'defaultDate',
                }}
                desktopModeMediaQuery={theme.breakpoints.up('sm')}
              />
            </LocalizationProvider>
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
