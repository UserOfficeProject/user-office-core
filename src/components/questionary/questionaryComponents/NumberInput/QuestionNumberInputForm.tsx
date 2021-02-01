import makeStyles from '@material-ui/core/styles/makeStyles';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { ChangeEvent, useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomSelect from 'components/common/FormikUICustomSelect';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionFormShell } from 'components/questionary/questionaryComponents/QuestionFormShell';
import { IntervalConfig, Question, NumberValueConstraint } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { allProperties, IntervalPropertyId } from '../Interval/intervalUnits';

const useStyles = makeStyles(theme => ({
  units: {
    minWidth: '100%',
  },
}));

const propertyDropdownEntries = Array.from(allProperties).map(
  ([id, property]) => ({
    text: property.name,
    value: id,
  })
);

export const QuestionNumberForm: FormComponent<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  const [showUnits, setShowUnits] = useState(
    (props.field.config as IntervalConfig).property !==
      IntervalPropertyId.UNITLESS
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
              items={propertyDropdownEntries}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                formikProps.setFieldValue('config.units', []); // reset units to empty array
                setShowUnits(e.target.value !== IntervalPropertyId.UNITLESS);
              }}
              InputProps={{
                'data-cy': 'property',
              }}
            />
            <Field
              name="config.units"
              component={FormikUICustomSelect}
              multiple
              label="Units"
              availableOptions={
                allProperties.get(
                  (formikProps.values.config as IntervalConfig)
                    .property as IntervalPropertyId
                )?.units || []
              }
              disabled={!showUnits}
              className={classes.units}
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
