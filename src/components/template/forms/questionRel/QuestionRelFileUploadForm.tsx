import { TextField } from 'formik-material-ui';
import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { QuestionRel } from '../../../../generated/sdk';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import FormikUICustomSelect from '../../../common/FormikUICustomSelect';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionRelFormShell } from './QuestionRelFormShell';
import { QuestionExcerpt } from './QuestionExcerpt';

export const QuestionRelFileUploadForm: TFormSignature<QuestionRel> = props => {
  return (
    <QuestionRelFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      label="File upload"
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            file_type: Yup.array(),
            small_label: Yup.string(),
            max_files: Yup.number(),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
          <TitledContainer label="Options">
            <Field
              name="question.config.small_label"
              label="Helper text"
              placeholder="(e.g. only PDF accepted)"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="small_label"
            />
          </TitledContainer>

          <TitledContainer label="Constraints">
            <Field
              name="question.config.file_type"
              label="Accepted file types (leave empty for any)"
              id="fileType"
              component={FormikUICustomSelect}
              availableOptions={[
                '.pdf',
                '.doc',
                '.docx',
                'audio/*',
                'video/*',
                'image/*',
              ]}
              margin="normal"
              fullWidth
              data-cy="file_type"
            />
            <Field
              name="question.config.max_files"
              label="Max number of files"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="max_files"
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
    </QuestionRelFormShell>
  );
};
