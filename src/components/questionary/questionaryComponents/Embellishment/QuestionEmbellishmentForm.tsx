import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import { QuestionFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { EmbellishmentConfig } from 'generated/sdk';
import { useNaturalKeySchema } from 'utils/userFieldValidationSchema';

import { QuestionFormShell } from '../QuestionFormShell';

export const QuestionEmbellishmentForm: FC<QuestionFormProps> = (props) => {
  const field = props.question;
  const naturalKeySchema = useNaturalKeySchema(field.naturalKey);

  return (
    <QuestionFormShell
      {...props}
      validationSchema={Yup.object().shape({
        naturalKey: naturalKeySchema,
        config: Yup.object({
          html: Yup.string().required('Content is required'),
          plain: Yup.string().required('Plain description is required'),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <Field
            name="naturalKey"
            label="Key"
            id="naturalKey-Input"
            type="text"
            component={TextField}
            fullWidth
            inputProps={{ 'data-cy': 'natural_key' }}
          />
          <Field
            name="config.html"
            id="HTML-Input"
            type="text"
            component={FormikUICustomEditor}
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
            id="Plain-Description-Input"
            label="Plain description"
            type="text"
            component={TextField}
            fullWidth
            data-cy="plain"
          />

          <Field
            name="config.omitFromPdf"
            id="Omit-from-pdf-checkbox"
            checked={
              (formikProps.values.config as EmbellishmentConfig).omitFromPdf
            }
            component={CheckboxWithLabel}
            type="checkbox"
            Label={{
              label: 'Omit from PDF',
            }}
            data-cy="omit"
          />
        </>
      )}
    </QuestionFormShell>
  );
};
