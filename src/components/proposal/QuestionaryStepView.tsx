import makeStyles from '@material-ui/core/styles/makeStyles';
import { Formik } from 'formik';
import React, { SyntheticEvent, useContext } from 'react';
import * as Yup from 'yup';

import { ErrorFocus } from 'components/common/ErrorFocus';
import UOLoader from 'components/common/UOLoader';
import { QuestionaryComponentFactory } from 'components/questionary/QuestionaryComponentFactory';
import { Questionary, QuestionaryStep } from 'generated/sdk';
import { EventType } from 'models/ProposalSubmissionModel';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
} from 'models/QuestionaryFunctions';
import submitFormAsync from 'utils/FormikAsyncFormHandler';

import { SubmissionContext } from '../../utils/SubmissionContext';
import { createFormikConfigObjects } from './createFormikConfigObjects';
import QuestionaryNavigationFragment from './QuestionaryNavigationFragment';

interface QuestionaryState {
  questionary: Questionary;
  isDirty: boolean;
}
export default function QuestionaryStepView(props: {
  state: QuestionaryState;
  topicId: number;
  readonly: boolean;
}) {
  const { state, topicId } = props;
  const componentFactory = new QuestionaryComponentFactory();
  const classes = makeStyles({
    componentWrapper: {
      margin: '10px 0',
    },
    disabled: {
      pointerEvents: 'none',
      opacity: 0.7,
    },
  })();
  const { dispatch } = useContext(SubmissionContext)!;

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

  const saveStepData = async (markAsComplete: boolean) => {
    dispatch({
      type: markAsComplete
        ? EventType.FINISH_STEP_CLICKED
        : EventType.SAVE_STEP_CLICKED,
      payload: {
        answers: activeFields,
        topicId: props.topicId,
      },
    });
  };

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
              disabled: !props.state.isDirty,
            }}
            save={
              questionaryStep.isCompleted
                ? undefined
                : {
                    callback: () => {
                      saveStepData(false);
                    },
                    disabled: !props.state.isDirty,
                  }
            }
            saveAndNext={{
              callback: () => {
                submitFormAsync(submitForm, validateForm).then(
                  (isValid: boolean) => {
                    if (isValid) {
                      saveStepData(true);
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
