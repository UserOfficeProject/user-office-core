import { Field } from 'formik';
import { CheckboxWithLabel, TextField } from 'formik-mui';
import React, { FC } from 'react';
import * as Yup from 'yup';

import FormikUICustomEditor from 'components/common/FormikUICustomEditor';
import TitledContainer from 'components/common/TitledContainer';
import { QuestionTemplateRelationFormProps } from 'components/questionary/QuestionaryComponentRegistry';

import QuestionDependencyList from '../QuestionDependencyList';
import { QuestionTemplateRelationFormShell } from '../QuestionTemplateRelationFormShell';

export const QuestionTemplateRelationEmbellishmentForm: FC<
  QuestionTemplateRelationFormProps
> = (props) => {
  return (
    <QuestionTemplateRelationFormShell
      {...props}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            html: Yup.string().required('Content is required'),
            plain: Yup.string().required('Plain description is required'),
          }),
        }),
      })}
    >
      {(formikProps) => (
        <>
          <Field
            name="config.html"
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
            label="Plain description"
            id="plain-description-input"
            type="text"
            component={TextField}
            fullWidth
            data-cy="plain"
          />

          <Field
            name="config.omitFromPdf"
            component={CheckboxWithLabel}
            type="checkbox"
            Label={{
              label: 'Omit from PDF',
            }}
            data-cy="omit"
          />

          <TitledContainer label="Dependencies">
            <QuestionDependencyList
              form={formikProps}
              template={props.template}
            />
          </TitledContainer>
        </>
      )}
    </QuestionTemplateRelationFormShell>
  );
};
