import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { Fragment } from 'react';
import FormikUICustomCheckbox from '../../common/FormikUICustomCheckbox';
import TitledContainer from '../../common/TitledContainer';
import { DateConfig } from '../../../generated/sdk';

export const DateConfigFragment = (props: { config: DateConfig }) => {
  return (
    <Fragment>
      <Field
        name="question.config.tooltip"
        label="Tooltip"
        type="text"
        component={TextField}
        margin="normal"
        fullWidth
        data-cy="tooltip"
      />
      <TitledContainer label="Constraints">
        <Field
          name="question.config.required"
          label="Is required"
          checked={props.config.required}
          component={FormikUICustomCheckbox}
          margin="normal"
          fullWidth
          data-cy="required"
        />
      </TitledContainer>
    </Fragment>
  );
};
