import { Field } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import TextField from 'components/common/FormikUITextField';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionReadPermissionsConfig } from 'components/questionary/QuestionReadPermissionsConfig';

import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationGenericTemplateBasisForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          titlePlaceholder: Yup.string(),
          questionLabel: Yup.string(),
        }),
      })}
    >
      {() => (
        <>
          <TitledContainer label="Question">
            <Field
              name="config.questionLabel"
              label="Question"
              component={TextField}
              type="text"
              inputProps={{ 'data-cy': 'question' }}
            />
          </TitledContainer>
          <QuestionReadPermissionsConfig
            config={props.questionRel.config}
            rolesData={props.rolesData}
          />
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
