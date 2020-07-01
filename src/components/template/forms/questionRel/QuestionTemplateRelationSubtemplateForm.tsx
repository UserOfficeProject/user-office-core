import { MenuItem } from '@material-ui/core';
import { Field } from 'formik';
import { Select, TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';
import {
  QuestionTemplateRelation,
  TemplateCategoryId,
} from '../../../../generated/sdk';
import { useTemplates } from '../../../../hooks/useTemplates';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionExcerpt } from './QuestionExcerpt';
import { QuestionTemplateRelationFormShell } from './QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationSubtemplateForm: TFormSignature<QuestionTemplateRelation> = props => {
  const { templates } = useTemplates(
    false,
    TemplateCategoryId.SAMPLE_DECLARATION
  );
  return (
    <QuestionTemplateRelationFormShell
      label="Sub template"
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            addEntryButtonLabel: Yup.string(),
            maxEntries: Yup.number().nullable(),
            templateId: Yup.number().required('Template is required'),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
          <TitledContainer label="Options">
            <Field
              name="config.addEntryButtonLabel"
              label="Add button label"
              placeholder='(e.g. "add new")'
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="addEntryButtonLabel"
            />
          </TitledContainer>

          <TitledContainer label="Constraints">
            <Field
              name="config.maxEntries"
              label="Max entries"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="maxEntries"
            />
          </TitledContainer>

          <TitledContainer label="Options">
            <Field
              name="config.templateId"
              label="Template name"
              placeholder="Choose template"
              type="text"
              component={Select}
              margin="normal"
              fullWidth
              data-cy="templateId"
            >
              {templates.map(template => {
                return (
                  <MenuItem value={template.templateId}>
                    {template.name}
                  </MenuItem>
                );
              })}
            </Field>
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
