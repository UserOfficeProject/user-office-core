import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import { SelectionFromOptionsConfig } from '../../../../generated/sdk';
import { EventType } from '../../../../models/QuestionaryEditorModel';
import FormikUICustomDependencySelector from '../../../common/FormikUICustomDependencySelector';
import TitledContainer from '../../../common/TitledContainer';
import { MultipleChoiceConfigFragment } from '../fragments/MultipleChoiceConfigFragment';
import { QuestionRelAdminComponentSignature } from '../QuestionRelEditor';
import { QuestionRelFormShell } from './QuestionRelFormShell';

export const QuestionRelMultipleChoiceForm: QuestionRelAdminComponentSignature = props => {
  const field = props.field;

  return (
    <Formik
      initialValues={field}
      onSubmit={async vals => {
        props.dispatch({
          type: EventType.UPDATE_FIELD_REQUESTED,
          payload: {
            field: { ...field, ...vals },
          },
        });
        props.closeMe();
      }}
      validationSchema={Yup.object().shape({
        question: Yup.object({
          config: Yup.object({
            required: Yup.bool(),
            variant: Yup.string().required('Variant is required'),
          }),
        }),
      })}
    >
      {formikProps => (
        <Form style={{ flexGrow: 1 }}>
          <QuestionRelFormShell {...props} label="Multiple choice">
            <MultipleChoiceConfigFragment
              config={
                formikProps.values.question.config as SelectionFromOptionsConfig
              }
            />
            <TitledContainer label="Dependencies">
              <Field
                name="dependency"
                component={FormikUICustomDependencySelector}
                templateField={props.field}
                template={props.template}
                margin="normal"
                fullWidth
                inputProps={{ 'data-cy': 'dependencies' }}
              />
            </TitledContainer>
          </QuestionRelFormShell>
        </Form>
      )}
    </Formik>
  );
};
