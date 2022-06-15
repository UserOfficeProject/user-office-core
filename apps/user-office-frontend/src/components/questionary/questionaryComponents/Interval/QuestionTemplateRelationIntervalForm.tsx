import Autocomplete from '@mui/lab/Autocomplete';
import MaterialTextField from '@mui/material/TextField';
import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { FC, useState } from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionExcerpt } from 'components/questionary/questionaryComponents/QuestionExcerpt';
import { IntervalConfig } from 'generated/sdk';
import { useUnitsData } from 'hooks/settings/useUnitData';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationIntervalForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  const intervalConfig = props.questionRel.config as IntervalConfig;
  const { units } = useUnitsData();
  const [selectedUnits, setSelectedUnits] = useState(intervalConfig.units);

  return (
    <QuestionTemplateRelationFormShell
      {...props}
      template={props.template}
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
      {(formikProps) => (
        <>
          <QuestionExcerpt question={props.questionRel.question} />
          <Field
            name="config.small_label"
            label="Small label"
            id="small-label-input"
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
                formikProps.setFieldValue('config.units', newValue);
              }}
              value={selectedUnits ?? undefined}
              data-cy="units"
            />
          </TitledContainer>

          <TitledContainer label="Dependencies">
            <QuestionDependencyList
              form={formikProps}
              template={props.template}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
