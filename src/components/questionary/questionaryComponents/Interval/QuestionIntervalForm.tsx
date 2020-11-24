import { makeStyles } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Qty from 'js-quantities';
import React, { ChangeEvent, useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomMultipleSelect from 'components/common/FormikUICustomMultipleSelect';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import { IntervalConfig, Question } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

const getAllProperties = () =>
  Qty.getKinds()
    .sort()
    .map(kind => {
      return {
        text: kind.split('_').join(' '),
        value: kind,
      };
    });

const getAllUnitsForProperty = (property: string) => {
  return Qty.getUnits(property || 'unitless');
};

const useStyles = makeStyles(theme => ({
  units: {
    minWidth: '100%',
  },
}));

export const QuestionIntervalForm: FormComponent<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  const [allProperties] = useState(getAllProperties());
  const [showUnits, setShowUnits] = useState(
    (props.field.config as IntervalConfig).property !== 'unitless'
  );

  const classes = useStyles();

  return (
    <QuestionFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        question: Yup.string().required('Question is required'),
        config: Yup.object({
          required: Yup.bool(),
          property: Yup.string().required('This property is required'),
          units: Yup.array().of(Yup.string()),
        }),
      })}
    >
      {formikProps => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="question"
            label="Question"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            inputProps={{ 'data-cy': 'question' }}
          />

          <Field
            name="config.small_label"
            label="Small label"
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

            <FormikDropdown
              name="config.property"
              label="Physical property"
              items={allProperties}
              InputProps={{
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  formikProps.setFieldValue('config.property', e.target.value);
                  formikProps.setFieldValue('config.units', []); // reset units to empty array
                  setShowUnits(e.target.value !== 'unitless');
                },
                'data-cy': 'property',
              }}
            />

            <Field
              name="config.units"
              component={FormikUICustomMultipleSelect}
              label="Units"
              availableOptions={getAllUnitsForProperty(
                (formikProps.values.config as IntervalConfig).property
              )}
              disabled={!showUnits}
              className={classes.units}
              data-cy="units"
            />
          </TitledContainer>
        </>
      )}
    </QuestionFormShell>
  );
};
