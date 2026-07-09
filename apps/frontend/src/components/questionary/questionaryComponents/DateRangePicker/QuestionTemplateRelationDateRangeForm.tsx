import useTheme from '@mui/material/styles/useTheme';
import { AdapterLuxon as DateAdapter } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Field } from 'formik';
import React, { useContext } from 'react';
import * as Yup from 'yup';

import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import DatePicker from 'components/common/FormikUIDatePicker';
import DateTimePicker from 'components/common/FormikUIDateTimePicker';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { SettingsContext } from 'context/SettingsContextProvider';
import { DateRangeConfig, SettingsId } from 'generated/sdk';
import { minMaxDateTimeCalculations } from 'utils/Time';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionExcerpt } from '../QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

//This defines what the user looks at when they create this question. It is the instanciation (child)
export const QuestionTemplateRelationDateForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const theme = useTheme();
  const { settingsMap } = useContext(SettingsContext);

  const dateTimeFormat = settingsMap.get(
    SettingsId.DATE_TIME_FORMAT
  )?.settingsValue;
  const dateFormat = settingsMap.get(SettingsId.DATE_FORMAT)?.settingsValue;

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({})}
    >
      {(formikProps) => {
        const { minDate, maxDate, includeTime } = formikProps.values
          .config as DateRangeConfig;
        const defaultDate = null;
        const { defaultFieldMaxDate, defaultFieldMinDate, isMinAfterMaxDate } =
          minMaxDateTimeCalculations({
            minDate,
            maxDate,
            defaultDate,
            includeTime,
          });

        if (formikProps.isValid) {
          if (isMinAfterMaxDate) {
            formikProps.setFieldError(
              'config.minDate',
              '"Min" date should be before "Max" date'
            );
          }
        }

        const component = includeTime ? DateTimePicker : DatePicker;
        const inputFormat = includeTime ? dateTimeFormat : dateFormat;

        return (
          <>
            <QuestionExcerpt question={props.questionRel.question} />
            <Field
              name="config.includeTime"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Include time',
              }}
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
                  label="Min"
                  id="Min-input"
                  ampm={false}
                  format={inputFormat}
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
                  format={inputFormat}
                  component={component}
                  minDate={defaultFieldMinDate}
                  textField={{
                    fullWidth: true,
                    'data-cy': 'maxDate',
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
