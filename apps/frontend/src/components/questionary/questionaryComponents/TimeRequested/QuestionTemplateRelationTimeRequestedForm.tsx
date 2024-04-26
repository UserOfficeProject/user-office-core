import { Field } from 'formik';
import { CheckboxWithLabel } from 'formik-mui';
import React from 'react';
import * as Yup from 'yup';

import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';
import { QuestionExcerpt } from 'components/questionary/questionaryComponents/QuestionExcerpt';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationTimeRequestedForm = (
  props: QuestionTemplateRelationFormProps
) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        config: Yup.object({
          required: Yup.bool(),
        }),
      })}
    >
      {(formikProps) => {
        return (
          <>
            <QuestionExcerpt question={props.questionRel.question} />
            <TitledContainer label="Constraints">
              <Field
                name="config.required"
                component={CheckboxWithLabel}
                type="checkbox"
                Label={{
                  label: 'Is required',
                }}
                InputProps={{ 'data-cy': 'required' }}
              />
            </TitledContainer>

            <TitledContainer label="Dependencies">
              <QuestionDependencyList
                form={formikProps}
                template={props.template}
              />
            </TitledContainer>
          </>
        );
      }}
    </QuestionTemplateRelationFormShell>
  );
};
