import { TextField as MaterialTextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { Field, getIn } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { FC, useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionExcerpt } from 'components/questionary/questionaryComponents/QuestionExcerpt';
import { NumberInputConfig, NumberValueConstraint } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationNumberForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  const numberConfig = props.questionRel.config as NumberInputConfig;
  const { units } = useUnitsData();
  const [selectedUnits, setSelectedUnits] = useState(numberConfig.units);

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        question: Yup.object({
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
              margin="normal"
              fullWidth
              inputProps={{ 'data-cy': 'small-label' }}
            />
            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                component={FormikUICustomCheckbox}
                label="Check to make this field mandatory"
                margin="normal"
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
                  <MaterialTextField {...params} label="Units" />
                )}
                onChange={(_event, newValue) => {
                  setSelectedUnits(newValue);
                  formikProps.setFieldValue('config.units', newValue);
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
