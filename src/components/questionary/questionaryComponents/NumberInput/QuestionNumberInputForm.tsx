import Autocomplete from '@mui/lab/Autocomplete';
import MaterialTextField from '@mui/material/TextField';
import { Field } from 'formik';
import { TextField } from 'formik-mui';
import React, { FC, useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import { NumberInputConfig, NumberValueConstraint } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

export const QuestionNumberForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const numberConfig = props.question.config as NumberInputConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { units } = useUnitsData();
  const [selectedUnits, setSelectedUnits] = useState(numberConfig.units);

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
            <Field
              name="config.required"
              component={FormikUICustomCheckbox}
              label="Check to make this field mandatory"
              fullWidth
              InputProps={{ 'data-cy': 'required' }}
            />

            <Autocomplete
              id="config-units"
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

            <FormikDropdown
              name="config.numberValueConstraint"
              label="Value constraint"
              InputProps={{
                'data-cy': 'numberValueConstraint',
              }}
              items={[
                { text: 'None', value: NumberValueConstraint.NONE },
                {
                  text: 'Only positive numbers',
                  value: NumberValueConstraint.ONLY_POSITIVE,
                },
                {
                  text: 'Only negative numbers',
                  value: NumberValueConstraint.ONLY_NEGATIVE,
                },
              ]}
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
