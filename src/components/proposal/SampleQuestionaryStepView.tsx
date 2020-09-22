import makeStyles from '@material-ui/core/styles/makeStyles';
import { ErrorFocus } from 'components/common/ErrorFocus';
import UOLoader from 'components/common/UOLoader';
import { QuestionaryComponentFactory } from 'components/questionary/QuestionaryComponentFactory';
import { Formik } from 'formik';
import { Questionary, QuestionaryStep } from 'generated/sdk';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
  prepareAnswers,
} from 'models/QuestionaryFunctions';
import { Event, EventType } from 'models/SampleSubmissionModel';
import React, { SyntheticEvent } from 'react';
import submitFormAsync from 'utils/FormikAsyncFormHandler';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import * as Yup from 'yup';
import { createFormikConfigObjects } from './createFormikConfigObjects';
import QuestionaryNavigationFragment from './QuestionaryNavigationFragment';

interface QuestionaryState {
  questionary: Questionary;
  isDirty: boolean;
}
export default function SampleQuestionaryStepView(props: {
  state: QuestionaryState;
  topicId: number;
  dispatch: React.Dispatch<Event>;
  readonly: boolean;
}) {
  const { state, topicId, dispatch } = props;
  const componentFactory = new QuestionaryComponentFactory();
  const { api } = useDataApiWithFeedback();
  const classes = makeStyles({
    componentWrapper: {
      margin: '10px 0',
    },
    disabled: {
      pointerEvents: 'none',
      opacity: 0.7,
    },
  })();

  if (state === null) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  const questionary = state.questionary!;
  const questionaryStep = getStepByTopicId(questionary.steps, topicId) as
    | QuestionaryStep
    | undefined;
  if (!questionaryStep) {
    return null;
  }

  const activeFields = questionaryStep
    ? questionaryStep.fields.filter(field => {
        return areDependenciesSatisfied(
          questionary.steps,
          field.question.proposalQuestionId
        );
      })
    : [];

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
                {componentFactory.createComponent(field, {
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
                  }, // for formik
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
                      api('Saved')
                        .answerTopic({
                          questionaryId: state.questionary.questionaryId!,
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
                      api('Saved')
                        .answerTopic({
                          questionaryId: state.questionary.questionaryId!,
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
