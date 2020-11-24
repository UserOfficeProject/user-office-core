import { makeStyles } from '@material-ui/core';
import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import Qty from 'js-quantities';
import React, { ChangeEvent, useState } from 'react';
import * as Yup from 'yup';

import FormikDropdown from 'components/common/FormikDropdown';
import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from 'components/common/FormikUICustomDependencySelector';
import FormikUICustomMultipleSelect from 'components/common/FormikUICustomMultipleSelect';
import TitledContainer from 'components/common/TitledContainer';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionExcerpt } from 'components/questionary/questionaryComponents/QuestionExcerpt';
import { IntervalConfig, QuestionTemplateRelation } from 'generated/sdk';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

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

export const QuestionTemplateRelationIntervalForm: FormComponent<QuestionTemplateRelation> = props => {
  const [allProperties] = useState(getAllProperties());
  const [showUnits, setShowUnits] = useState(
    (props.field.config as IntervalConfig).property !== 'unitless'
  );

  const classes = useStyles();

  return (
    <QuestionTemplateRelationFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            required: Yup.bool(),
            property: Yup.string().required('This property is required'),
            units: Yup.array().of(Yup.string()),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
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
              data-cy="property"
              InputProps={{
                onChange: (e: ChangeEvent<HTMLInputElement>) => {
                  formikProps.setFieldValue('config.property', e.target.value);
                  formikProps.setFieldValue('config.units', []); // reset units to empty array
                  setShowUnits(e.target.value !== 'unitless');
                },
              }}
            />

            <Field
              name="config.units"
              component={FormikUICustomMultipleSelect}
              label="Units"
              margin="normal"
              availableOptions={getAllUnitsForProperty(
                (formikProps.values.config as IntervalConfig).property
              )}
              disabled={!showUnits}
              className={classes.units}
            />
          </TitledContainer>

          <TitledContainer label="Dependencies">
            <Field
              name="dependency"
              component={FormikUICustomDependencySelector}
              templateField={props.field}
              template={props.template}
              margin="normal"
              fullWidth
              data-cy="dependencies"
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
