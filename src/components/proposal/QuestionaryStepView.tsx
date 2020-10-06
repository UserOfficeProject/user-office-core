import makeStyles from '@material-ui/core/styles/makeStyles';
import { Formik } from 'formik';
import React, { SyntheticEvent } from 'react';
import * as Yup from 'yup';

import { ErrorFocus } from 'components/common/ErrorFocus';
import UOLoader from 'components/common/UOLoader';
import { createComponent } from 'components/questionary/QuestionaryComponentFactory';
import { QuestionaryStep } from 'generated/sdk';
import { usePreSubmitFunctionQueue } from 'hooks/questionary/usePreSubmitFunctionQueue';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
  prepareAnswers,
} from 'models/QuestionaryFunctions';
import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionModel';
import submitFormAsync from 'utils/FormikAsyncFormHandler';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import { createFormikConfigObjects } from './createFormikConfigObjects';
import QuestionaryNavigationFragment from './QuestionaryNavigationFragment';

const useStyles = makeStyles({
  componentWrapper: {
    margin: '10px 0',
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },
});

export default function QuestionaryStepView(props: {
  state: QuestionarySubmissionState;
  topicId: number;
  dispatch: React.Dispatch<Event>;
  readonly: boolean;
}) {
  const { state, topicId, dispatch } = props;
  const { api } = useDataApiWithFeedback();
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

  const presubmitFunctionQueue = usePreSubmitFunctionQueue(activeFields);

  if (state === null || !questionaryStep) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const { initialValues, validationSchema } = createFormikConfigObjects(
    activeFields
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={() => {}}
      enableReinitialize={true}
    >
      {({
        errors,
        touched,
        handleChange,
        submitForm,
        validateForm,
        isSubmitting,
      }) => (
        <form className={props.readonly ? classes.disabled : undefined}>
          {activeFields.map(field => {
            return (
              <div
                className={classes.componentWrapper}
                key={field.question.proposalQuestionId}
              >
                {createComponent(field, {
                  touched: touched, // for formik
                  errors: errors, // for formik
                  onComplete: (evt: SyntheticEvent, newValue: any) => {
                    if (field.value !== newValue) {
                      dispatch({
                        type: EventType.FIELD_CHANGED,
                        payload: {
                          id: field.question.proposalQuestionId,
                          newValue: newValue,
                        },
                      });
                      handleChange(evt);
                    }
                  },
                  dispatch: dispatch,
                })}
              </div>
            );
          })}
          <QuestionaryNavigationFragment
            disabled={props.readonly}
            back={{
              callback: () => {
                dispatch({ type: EventType.BACK_CLICKED });
              },
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
                      if (!state.questionaryId) {
                        throw new Error('questionaryId not set');
                      }
                      api('Saved')
                        .answerTopic({
                          questionaryId: state.questionaryId,
                          answers: prepareAnswers(questionaryStep.fields),
                          topicId: topicId,
                          isPartialSave: true,
                        })
                        .then(result => {
                          if (!result.answerTopic.error) {
                            dispatch({
                              type: EventType.QUESTIONARY_STEP_ANSWERED,
                              payload: {
                                questionaryStep:
                                  result.answerTopic.questionaryStep,
                                partially: true,
                              },
                            });
                          }
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
                      Promise.all(
                        presubmitFunctionQueue.map(f => f(state, dispatch))
                      ).then(result => {
                        if (!state.questionaryId) {
                          throw new Error('questionaryId not set');
                        }
                        api('Saved')
                          .answerTopic({
                            questionaryId: state.questionaryId,
                            answers: prepareAnswers(questionaryStep.fields),
                            topicId: topicId,
                            isPartialSave: false,
                          })
                          .then(result => {
                            if (!result.answerTopic.error) {
                              dispatch({
                                type: EventType.QUESTIONARY_STEP_ANSWERED,
                                payload: {
                                  questionaryStep:
                                    result.answerTopic.questionaryStep,
                                  partially: false,
                                },
                              });
                              dispatch({ type: EventType.GO_STEP_FORWARD });
                            }
                          });
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
      )}
    </Formik>
  );
}
