import { TextField } from '@material-ui/core';
import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { EmbellishmentConfig, Question } from '../../../../generated/sdk';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomEditor from '../../../common/FormikUICustomEditor';
import { TFormSignature } from '../TFormSignature';
import { QuestionFormShell } from './QuestionFormShell';

export const QuestionEmbellismentForm: TFormSignature<Question> = props => {
  return (
    <QuestionFormShell
      label="Embellisment"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      field={props.field}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            html: Yup.string().required('Content is required'),
            plain: Yup.string().required('Plain description is required'),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
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
