import { Field } from 'formik';
import React from 'react';
import { BooleanConfig } from '../../../generated/sdk';
import FormikUICustomCheckbox from '../../common/FormikUICustomCheckbox';
import TitledContainer from '../../common/TitledContainer';

export const BooleanConfigFragment = (props: { config: BooleanConfig }) => {
  return (
    <TitledContainer label="Constraints">
      <Field
        name="question.config.required"
        checked={props.config.required}
        component={FormikUICustomCheckbox}
        label="User must check it to continue"
        margin="normal"
        fullWidth
        data-cy="required"
      />
    </TitledContainer>
  );
};
