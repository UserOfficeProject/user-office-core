import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React, { Fragment } from 'react';
import FormikUICustomCheckbox from '../../common/FormikUICustomCheckbox';
import { EmbellishmentConfig } from '../../../generated/sdk';
import FormikUICustomEditor from '../../common/FormikUICustomEditor';

export const EmbellishmentConfigFragment = (props: {
  config: EmbellishmentConfig;
}) => {
  return (
    <Fragment>
      <Field
        name="question.config.html"
        type="text"
        component={FormikUICustomEditor}
        margin="normal"
        fullWidth
        init={{
          skin: false,
          content_css: false,
          plugins: ['link', 'preview', 'image', 'code'],
          toolbar: 'bold italic',
          branding: false,
        }}
        data-cy="html"
      />

      <Field
        name="question.config.plain"
        label="Plain description"
        type="text"
        component={TextField}
        margin="normal"
        fullWidth
        data-cy="plain"
      />

      <Field
        name="question.config.omitFromPdf"
        checked={props.config.omitFromPdf}
        component={FormikUICustomCheckbox}
        label="Omit from PDF"
        margin="normal"
        fullWidth
        data-cy="omit"
      />
    </Fragment>
  );
};
