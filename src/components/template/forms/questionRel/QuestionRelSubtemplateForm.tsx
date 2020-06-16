import { Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';
import * as Yup from 'yup';

import { QuestionRel } from '../../../../generated/sdk';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import FormikUICustomSelect from '../../../common/FormikUICustomSelect';
import TitledContainer from '../../../common/TitledContainer';
import { TFormSignature } from '../TFormSignature';
import { QuestionExcerpt } from './QuestionExcerpt';
import { QuestionRelFormShell } from './QuestionRelFormShell';

export const QuestionRelSubtemplateForm: TFormSignature<QuestionRel> = props => {
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
            subtemplateId: Yup.array(),
            title: Yup.array(),
            addEntryButtonLabel: Yup.array(),
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
              name="config.subtemplateId"
              label="Accepted file types (leave empty for any)"
              id="subtemplateId"
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
              data-cy="subtemplateId"
            />

            <Field
              name="config.title"
              label="Title"
              placeholder="The title"
              type="text"
              component={TextField}
              margin="normal"
              fullWidth
              data-cy="title"
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
