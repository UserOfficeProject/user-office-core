import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';
import { QuestionRel, TemplateCategoryId } from '../../../../generated/sdk';
import { useTemplates } from '../../../../hooks/useTemplates';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import FormikUICustomSelect from '../../../common/FormikUICustomSelect';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionExcerpt } from './QuestionExcerpt';
import { QuestionRelFormShell } from './QuestionRelFormShell';

export const QuestionRelSubtemplateForm: TFormSignature<QuestionRel> = props => {
  const { templates } = useTemplates(
    false,
    TemplateCategoryId.SAMPLE_DECLARATION
  );
  return (
    <QuestionRelFormShell
      closeMe={props.closeMe}
      dispatch={props.dispatch}
      questionRel={props.field}
      label="Sub template"
      template={props.template}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            templateId: Yup.number(),
            addEntryButtonLabel: Yup.string(),
            maxEntries: Yup.number(),
          }),
        }),
      })}
    >
      {formikProps => (
        <>
          <QuestionExcerpt question={props.field.question} />
          <TitledContainer label="Options">
            <Field
              name="config.templateId"
              label="Template id"
              placeholder="Choose template"
              type="text"
              component={FormikUICustomSelect}
              margin="normal"
              fullWidth
              data-cy="templateId"
              availableOptions={templates.map(template => {
                return { value: template.templateId, label: template.name };
              })}
            />
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
