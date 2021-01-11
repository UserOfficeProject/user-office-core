import makeStyles from '@material-ui/core/styles/makeStyles';
import { Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { ErrorFocus } from 'components/common/ErrorFocus';
import UOLoader from 'components/common/UOLoader';
import { Answer, QuestionaryStep } from 'generated/sdk';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
} from 'models/QuestionaryFunctions';
import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import submitFormAsync from 'utils/FormikAsyncFormHandler';

import NavigationFragment from './NavigationFragment';
import {
  createQuestionaryComponent,
  getQuestionaryComponentDefinition,
} from './QuestionaryComponentRegistry';

const useStyles = makeStyles({
  componentWrapper: {
    margin: '10px 0',
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },
});

export const createFormikConfigObjects = (
  answers: Answer[],
  state: QuestionarySubmissionState
): { validationSchema: any; initialValues: any } => {
  const validationSchema: any = {};
  const initialValues: any = {};

  answers.forEach(answer => {
    const definition = getQuestionaryComponentDefinition(
      answer.question.dataType
    );
    if (definition.createYupValidationSchema) {
      validationSchema[
        answer.question.proposalQuestionId
      ] = definition.createYupValidationSchema(answer);
      initialValues[
        answer.question.proposalQuestionId
      ] = definition.getYupInitialValue({ answer, state });
    }
  });

  return { initialValues, validationSchema };
};

export default function QuestionaryStepView(props: {
  state: QuestionarySubmissionState;
  topicId: number;
  dispatch: React.Dispatch<Event>;
  readonly: boolean;
}) {
  const { state, topicId, dispatch } = props;
  const classes = useStyles();

  const questionaryStep = getStepByTopicId(state.steps, topicId) as
    | QuestionaryStep
    | undefined;

  const activeFields = questionaryStep
    ? questionaryStep.fields.filter(field => {
        return areDependenciesSatisfied(
          state.steps,
          field.question.proposalQuestionId
        );
      })
    : [];

  if (state === null || !questionaryStep) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const { initialValues, validationSchema } = createFormikConfigObjects(
    activeFields,
    state
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={() => {}}
      enableReinitialize={true}
    >
      {formikProps => {
        const {
          submitForm,
          validateForm,
          setFieldValue,
          isSubmitting,
        } = formikProps;

        return (
          <form className={props.readonly ? classes.disabled : undefined}>
            {activeFields.map(field => {
              return (
                <div
                  className={classes.componentWrapper}
                  key={field.question.proposalQuestionId}
                >
                  {createQuestionaryComponent({
                    answer: field,
                    formikProps,
                    onComplete: (newValue: Answer['value']) => {
                      if (field.value !== newValue) {
                        dispatch({
                          type: EventType.FIELD_CHANGED,
                          payload: {
                            id: field.question.proposalQuestionId,
                            newValue: newValue,
                          },
                        });
                        setFieldValue(
                          field.question.proposalQuestionId,
                          newValue,
                          true
                        );
                      }
                    },
                  })}
                </div>
              );
            })}
            <NavigationFragment
              disabled={props.readonly}
              back={{
                callback: () => {
                  dispatch({ type: EventType.BACK_CLICKED });
                },
                disabled: state.stepIndex === 0,
              }}
              reset={{
                callback: () => dispatch({ type: EventType.RESET_CLICKED }),
                disabled: !state.isDirty,
              }}
              save={
                questionaryStep.isCompleted
                  ? undefined
                  : {
                      callback: () => {
                        dispatch({
                          type: EventType.SAVE_CLICKED,
                          payload: { answers: activeFields, topicId: topicId },
                        });
                      },
                      disabled: !props.state.isDirty,
                    }
              }
              saveAndNext={{
                callback: () => {
                  submitFormAsync(submitForm, validateForm).then(
                    (isValid: boolean) => {
                      if (isValid) {
                        dispatch({
                          type: EventType.SAVE_AND_CONTINUE_CLICKED,
                          payload: { answers: activeFields, topicId: topicId },
                        });
                      }
                    }
                  );
                },
              }}
              isLoading={isSubmitting}
            />
            <ErrorFocus />
          </form>
        );
      }}
    </Formik>
  );
}
