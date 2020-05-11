import { TextField } from '@material-ui/core';
import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { EmbellishmentConfig, QuestionRel } from '../../../../generated/sdk';
import FormikUICustomCheckbox from '../../../common/FormikUICustomCheckbox';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import FormikUICustomEditor from '../../../common/FormikUICustomEditor';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionRelFormShell } from './QuestionRelFormShell';

export const QuestionRelEmbellismentForm: TFormSignature<QuestionRel> = props => {
  return (
    <QuestionRelFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      field={props.field}
      label="Embellishment"
      template={props.template}
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
            checked={
              (formikProps.values.question.config as EmbellishmentConfig)
                .omitFromPdf
            }
            component={FormikUICustomCheckbox}
            label="Omit from PDF"
            margin="normal"
            fullWidth
            data-cy="omit"
          />

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
    </QuestionRelFormShell>
  );
};
