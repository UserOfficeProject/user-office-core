import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomCheckbox from 'components/common/FormikUICustomCheckbox';
import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import { FormComponent } from 'components/questionary/QuestionaryComponentRegistry';
import { EmbellishmentConfig, Question } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionEmbellismentForm: FormComponent<Question> = props => {
  const field = props.field;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      question={props.field}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        config: Yup.object({
          html: Yup.string().required('Content is required'),
          plain: Yup.string().required('Plain description is required'),
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
            name="config.html"
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
            name="config.plain"
            label="Plain description"
            type="text"
            component={TextField}
            margin="normal"
            fullWidth
            data-cy="plain"
          />

          <Field
            name="config.omitFromPdf"
            checked={
              (formikProps.values.config as EmbellishmentConfig).omitFromPdf
            }
            component={FormikUICustomCheckbox}
            label="Omit from PDF"
            margin="normal"
            fullWidth
            data-cy="omit"
          />
        </>
      )}
    </QuestionFormShell>
  );
};
