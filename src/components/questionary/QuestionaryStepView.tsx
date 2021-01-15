import makeStyles from '@material-ui/core/styles/makeStyles';
import { Formik, useFormikContext } from 'formik';
import React, { useContext } from 'react';
import { Prompt } from 'react-router';
import * as Yup from 'yup';

import { useCheckAccess } from 'components/common/Can';
import { ErrorFocus } from 'components/common/ErrorFocus';
import UOLoader from 'components/common/UOLoader';
import { Answer, QuestionaryStep, UserRole } from 'generated/sdk';
import { usePreSubmitActions } from 'hooks/questionary/useSubmitActions';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
  prepareAnswers,
} from 'models/QuestionaryFunctions';
import {
  EventType,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import submitFormAsync from 'utils/FormikAsyncFormHandler';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import NavigationFragment from './NavigationFragment';
import {
  createQuestionaryComponent,
  getQuestionaryComponentDefinition,
} from './QuestionaryComponentRegistry';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from './QuestionaryContext';

const useStyles = makeStyles(theme => ({
  componentWrapper: {
    margin: theme.spacing(1, 0),
  },
  disabled: {
    pointerEvents: 'none',
    opacity: 0.7,
  },
}));

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

const PromptIfDirty = () => {
  const formik = useFormikContext();

  return (
    <Prompt
      when={formik.dirty && formik.submitCount === 0}
      message="Changes you recently made in this step will not be saved! Are you sure?"
    />
  );
};

export default function QuestionaryStepView(props: {
  topicId: number;
  readonly: boolean;
  onStepComplete?: (topicId: number) => any;
}) {
  const { topicId } = props;
  const classes = useStyles();

  const preSubmitActions = usePreSubmitActions();
  const { api } = useDataApiWithFeedback();

  const { state, dispatch } = useContext(QuestionaryContext);

  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const questionaryStep = getStepByTopicId(state.steps, topicId) as
    | QuestionaryStep
    | undefined;

  if (!questionaryStep) {
    throw new Error(
      `Could not find questionary step with topic id: ${topicId}`
    );
  }

  const activeFields = questionaryStep.fields.filter(field => {
    return areDependenciesSatisfied(
      state.steps,
      field.question.proposalQuestionId
    );
  });

  const saveHandler = async (isPartialSave: boolean) => {
    const result =
      (
        await Promise.all(
          preSubmitActions(activeFields).map(
            async f => await f({ state, dispatch, api: api() })
          )
        )
      ).pop() || state.questionaryId; // TODO obtain newly created questionary ID some other way

    const questionaryId = state.questionaryId || result;
    if (!questionaryId) {
      throw new Error('Missing questionaryId');
    }

    const answerTopicResult = await api('Saved').answerTopic({
      questionaryId: questionaryId,
      answers: prepareAnswers(activeFields),
      topicId: topicId,
      isPartialSave: isPartialSave,
    });

    if (answerTopicResult.answerTopic.questionaryStep) {
      dispatch({
        type: EventType.QUESTIONARY_STEP_ANSWERED,
        payload: {
          questionaryStep: answerTopicResult.answerTopic.questionaryStep,
        },
      });
    }
  };

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
      validationSchema={
        isUserOfficer ? null : Yup.object().shape(validationSchema)
      }
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
            <PromptIfDirty />
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
                      callback: () => saveHandler(true),
                      disabled: !state.isDirty,
                    }
              }
              saveAndNext={{
                callback: () => {
                  submitFormAsync(submitForm, validateForm).then(
                    async (isValid: boolean) => {
                      if (isValid) {
                        await saveHandler(false);
                        dispatch({ type: EventType.GO_STEP_FORWARD });
                        props.onStepComplete?.(topicId);
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
