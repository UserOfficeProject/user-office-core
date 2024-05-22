import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import MaterialTextField from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { Field } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import { IntervalConfig } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

export const QuestionIntervalForm = (props: QuestionFormProps) => {
  const field = props.question;
  const intervalConfig = props.question.config as IntervalConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { units } = useUnitsData();
  const [selectedUnits, setSelectedUnits] = useState(intervalConfig.units);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          units: Yup.array().of(
            Yup.object({
              id: Yup.string(),
              quantity: Yup.string(),
              siConversionFormula: Yup.string(),
              symbol: Yup.string(),
              unit: Yup.string(),
            })
          ),
        }),
      })}
    >
      {({ setFieldValue }) => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="Key-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            id="Question-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <Field
            name="config.small_label"
            label="Small label"
            id="Small-label-input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'small-label' }}
          />

          <TitledContainer label="Constraints">
            {/* <Field
              name="config.required"
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              InputProps={{ 'data-cy': 'required' }}
            /> */}
            <Field
              name="config.required"
              component={Checkbox}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              InputProps={{ 'data-cy': 'required' }}
            />

            <Autocomplete
              multiple
              options={units}
              getOptionLabel={({ unit, symbol, quantity }) =>
                `${symbol} (${unit}) - ${quantity}`
              }
              renderInput={(params) => (
                <MaterialTextField {...params} label="Units" margin="none" />
              )}
              onChange={(_event, newValue) => {
                setSelectedUnits(newValue);
                setFieldValue('config.units', newValue);
              }}
              value={selectedUnits ?? undefined}
              data-cy="units"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
