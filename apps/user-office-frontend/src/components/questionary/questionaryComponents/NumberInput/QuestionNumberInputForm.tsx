import LaunchIcon from '@mui/icons-material/Launch';
import Autocomplete from '@mui/lab/Autocomplete';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import MaterialTextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { FC, useState } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import { NumberInputConfig, NumberValueConstraint } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

const useStyles = makeStyles((theme) => ({
  iconVerticalAlign: {
    verticalAlign: 'middle',
    marginLeft: theme.spacing(0.5),
  },
  textRightAlign: {
    textAlign: 'right',
  },
}));

export const QuestionNumberForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const numberConfig = props.question.config as NumberInputConfig;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);
  const { units } = useUnitsData();
  const classes = useStyles();
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
              component={CheckboxWithLabel}
              type="checkbox"
              Label={{
                label: 'Is required',
              }}
              InputProps={{ 'data-cy': 'required' }}
            />
            <FormControl fullWidth>
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

              <Link
                href="/Units/"
                target="_blank"
                className={classes.textRightAlign}
              >
                View/Edit all units
                <LaunchIcon
                  fontSize="small"
                  className={classes.iconVerticalAlign}
                />
              </Link>
            </FormControl>

            <FormikUIAutocomplete
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
                {
                  text: 'Only positive integers',
                  value: NumberValueConstraint.ONLY_POSITIVE_INTEGER,
                },
                {
                  text: 'Only negative integers',
                  value: NumberValueConstraint.ONLY_NEGATIVE_INTEGER,
                },
              ]}
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
