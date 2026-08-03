import Autocomplete from '@mui/material/Autocomplete';
import MUITextField from '@mui/material/TextField';
import { Field, getIn } from 'formik';
import React, { useState } from 'react';
import * as Yup from 'yup';

import FormikUIAutocomplete from 'components/common/FormikUIAutocomplete';
import CheckboxWithLabel from 'components/common/FormikUICheckboxWithLabel';
import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionExcerpt } from 'components/questionary/questionaryComponents/QuestionExcerpt';
import { NumberInputConfig, NumberValueConstraint } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationNumberForm = (
  props: QuestionTemplateRelationFormProps
) => {
  const numberConfig = props.questionRel.config as NumberInputConfig;
  const { units } = useUnitsData();
  const [selectedUnits, setSelectedUnits] = useState(numberConfig.units);

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
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
          numberMin: Yup.number()
            .typeError('Value must be a number')
            .nullable(),
          numberMinInclusive: Yup.bool().nullable(),
          numberMaxInclusive: Yup.bool().nullable(),
          numberMax: Yup.number()
            .typeError('Value must be a number')
            .nullable()
            // We cannot do the same for numberMin because it would create a circular dependency
            .when(
              ['numberMin', 'numberMaxInclusive', 'numberMinInclusive'],
              ([numberMin, numberMaxInclusive, numberMinInclusive], schema) => {
                if (numberMin !== undefined) {
                  if (numberMinInclusive && numberMaxInclusive) {
                    return schema.min(
                      numberMin,
                      'Maximum must be greater than or equal to Minimum'
                    );
                  } else {
                    return schema.moreThan(
                      numberMin,
                      'Maximum must be strictly greater than Minimum'
                    );
                  }
                }

                return schema;
              }
            ),
        }),
      })}
    >
      {(formikProps) => {
        if (!getIn(formikProps.values, 'config.numberValueConstraint')) {
          formikProps.setFieldValue(
            'config.numberValueConstraint',
            NumberValueConstraint.NONE
          );
        }

        return (
          <>
            <QuestionExcerpt question={props.questionRel.question} />
            <Field
              name="config.small_label"
              label="Small label"
              id="small-label-id"
              type="text"
              component={TextField}
              fullWidth
              slotProps={{
                htmlInput: { 'data-cy': 'small-label' },
              }}
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

              <Autocomplete
                id="config-units"
                multiple
                options={units}
                getOptionLabel={({ unit, symbol, quantity }) =>
                  `${symbol} (${unit}) - ${quantity}`
                }
                renderInput={(params) => (
                  <MUITextField {...params} label="Units" margin="none" />
                )}
                onChange={(_event, newValue) => {
                  setSelectedUnits(newValue);
                  formikProps.setFieldValue('config.units', newValue);
                }}
                value={selectedUnits ?? undefined}
                data-cy="units"
              />

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
              <Field
                name="config.numberMin"
                label="Minimum"
                id="config.numberMin"
                type="number"
                component={TextField}
                fullWidth
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value =
                    e.target.value === '' ? null : Number(e.target.value);
                  formikProps.setFieldValue('config.numberMin', value);
                  //Trigger validation for numberMax when numberMin changes
                  formikProps.setFieldTouched('config.numberMax', true, true);
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.value === '' &&
                    formikProps.setFieldValue(
                      'config.numberMinInclusive',
                      false
                    );
                }}
                slotProps={{
                  htmlInput: { 'data-cy': 'numberMin' },
                }}
              />
              {(formikProps.values.config as NumberInputConfig).numberMin !==
                null && (
                <Field
                  name="config.numberMinInclusive"
                  id="config.numberMinInclusive"
                  type="checkbox"
                  component={CheckboxWithLabel}
                  Label={{
                    label: 'Minimum is inclusive',
                  }}
                  inputProps={{ 'data-cy': 'numberMinInclusive' }}
                />
              )}
              <Field
                name="config.numberMax"
                label="Maximum"
                id="config.numberMax"
                type="number"
                component={TextField}
                fullWidth
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value =
                    e.target.value === '' ? null : Number(e.target.value);
                  formikProps.setFieldValue('config.numberMax', value);
                }}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                  e.target.value === '' &&
                    formikProps.setFieldValue(
                      'config.numberMaxInclusive',
                      false
                    );
                }}
                slotProps={{
                  htmlInput: { 'data-cy': 'numberMax' },
                }}
              />
              {(formikProps.values.config as NumberInputConfig).numberMax !==
                null && (
                <Field
                  name="config.numberMaxInclusive"
                  id="config.numberMaxInclusive"
                  type="checkbox"
                  component={CheckboxWithLabel}
                  Label={{
                    label: 'Maximum is inclusive',
                  }}
                  inputProps={{ 'data-cy': 'numberMaxInclusive' }}
                />
              )}
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
