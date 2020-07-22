import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import FormikUICustomDependencySelector from 'components/common/FormikUICustomDependencySelector';
import FormikUICustomMultipleSelect from 'components/common/FormikUICustomMultipleSelect';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelation } from 'generated/sdk';

import { TFormSignature } from '../TFormSignature';
import { QuestionExcerpt } from './QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from './QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationFileUploadForm: TFormSignature<QuestionTemplateRelation> = props => {
  return (
    <QuestionTemplateRelationFormShell
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
              name="config.small_label"
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
              name="config.file_type"
              label="Accepted file types (leave empty for any)"
              id="fileType"
              component={FormikUICustomMultipleSelect}
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
              name="config.max_files"
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
    </QuestionTemplateRelationFormShell>
  );
};
