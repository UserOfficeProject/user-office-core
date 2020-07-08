import { makeStyles } from '@material-ui/core';
import { Formik } from 'formik';
import React, { SyntheticEvent, useContext } from 'react';
import * as Yup from 'yup';

import { ErrorFocus } from 'components/common/ErrorFocus';
import { QuestionaryComponentFactory } from 'components/questionary/QuestionaryComponentFactory';
import { QuestionaryStep } from 'generated/sdk';
import { useUpdateProposal } from 'hooks/useUpdateProposal';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
} from 'models/ProposalModelFunctions';
import {
  EventType,
  ProposalSubmissionModelState,
} from 'models/ProposalSubmissionModel';
import submitFormAsync from 'utils/FormikAsyncFormHandler';

import { createFormikConfigObjects } from './createFormikConfigObjects';
import { ProposalSubmissionContext } from './ProposalContainer';
import ProposalNavigationFragment from './ProposalNavigationFragment';

export default function ProposalQuestionaryStep(props: {
  data: ProposalSubmissionModelState;
  topicId: number;
  readonly: boolean;
}) {
  const { data, topicId } = props;
  const componentFactory = new QuestionaryComponentFactory();
  const { loading: formSaving } = useUpdateProposal();
  const classes = makeStyles({
    componentWrapper: {
      margin: '10px 0',
    },
    disabled: {
      pointerEvents: 'none',
      opacity: 0.7,
    },
  })();
  const { dispatch } = useContext(ProposalSubmissionContext)!;

  if (data === null) {
    return <div>loading...</div>;
  }

  const questionary = data.proposal.questionary!;
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
      {({ errors, touched, handleChange, submitForm, validateForm }) => (
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
          <ProposalNavigationFragment
            disabled={props.readonly}
            back={{
              callback: () => {
                dispatch({ type: EventType.BACK_CLICKED });
              },
            }}
            reset={{
              callback: () => dispatch({ type: EventType.RESET_CLICKED }),
              disabled: !props.data.isDirty,
            }}
            save={
              questionaryStep.isCompleted
                ? undefined
                : {
                    callback: () => {
                      saveStepData(false);
                    },
                    disabled: !props.data.isDirty,
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
            isLoading={formSaving}
          />
          <ErrorFocus />
        </form>
      )}
    </Formik>
  );
}
