import makeStyles from '@material-ui/core/styles/makeStyles';
import { Formik, useFormikContext } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import { Prompt } from 'react-router';
import * as Yup from 'yup';

import { useCheckAccess } from 'components/common/Can';
import { ErrorFocus } from 'components/common/ErrorFocus';
import { NavigButton } from 'components/common/NavigButton';
import UOLoader from 'components/common/UOLoader';
import { Answer, QuestionaryStep, Sdk, UserRole } from 'generated/sdk';
import { usePreSubmitActions } from 'hooks/questionary/useSubmitActions';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
  prepareAnswers,
} from 'models/QuestionaryFunctions';
import { QuestionarySubmissionState } from 'models/QuestionarySubmissionState';
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

const useStyles = makeStyles((theme) => ({
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
  state: QuestionarySubmissionState,
  api: () => Sdk
): {
  // eslint-disable-next-line @typescript-eslint/ban-types
  validationSchema: object;
  initialValues: Record<string, unknown>;
} => {
  const validationSchema: Record<string, unknown> = {};
  const initialValues: Record<string, unknown> = {};

  answers.forEach((answer) => {
    const definition = getQuestionaryComponentDefinition(
      answer.question.dataType
    );
    if (definition.createYupValidationSchema) {
      validationSchema[
        answer.question.id
      ] = definition.createYupValidationSchema(answer, state, api);
      initialValues[answer.question.id] = definition.getYupInitialValue({
        answer,
        state,
      });
    }
  });

  return { initialValues, validationSchema };
};

const PromptIfDirty = ({ isDirty }: { isDirty: boolean }) => {
  const formik = useFormikContext();

  return (
    <Prompt
      when={isDirty && formik.submitCount === 0}
      message="Changes you recently made in this step will not be saved! Are you sure?"
    />
  );
};

export default function QuestionaryStepView(props: {
  topicId: number;
  readonly: boolean;
  onStepComplete?: (topicId: number) => void;
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

  const isCallActive = state.proposal?.call?.isActive ?? true;

  const readOnly = !isUserOfficer && (!isCallActive || props.readonly);

  const questionaryStep = getStepByTopicId(state.steps, topicId) as
    | QuestionaryStep
    | undefined;

  if (!questionaryStep) {
    throw new Error(
      `Could not find questionary step with topic id: ${topicId}`
    );
  }

  const activeFields = questionaryStep.fields.filter((field) => {
    return areDependenciesSatisfied(state.steps, field.question.id);
  });

  const { initialValues, validationSchema } = createFormikConfigObjects(
    activeFields,
    state,
    api
  );

  const [lastSavedFormValues, setLastSavedFormValues] = useState(initialValues);

  useEffect(() => {
    setLastSavedFormValues(initialValues);
    // NOTE: We need to update lastSavedFormValues when we change the topic so it has actual form initial values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    const alertUserOnRouteLeave = (e: Event) => {
      e.preventDefault();
      if (
        JSON.stringify(lastSavedFormValues) !== JSON.stringify(initialValues)
      ) {
        e.returnValue = true;
      }
    };

    const cleanDirtyState = () => {
      if (
        state.isDirty &&
        JSON.stringify(initialValues) === JSON.stringify(lastSavedFormValues)
      ) {
        dispatch({
          type: 'CLEAN_DIRTY_STATE',
        });
      }
    };

    window.addEventListener('beforeunload', alertUserOnRouteLeave);
    cleanDirtyState();

    return () => {
      window.removeEventListener('beforeunload', alertUserOnRouteLeave);
    };
  }, [initialValues, lastSavedFormValues, state.isDirty, dispatch]);

  const performSave = async (isPartialSave: boolean): Promise<boolean> => {
    const questionaryId =
      (
        await Promise.all(
          preSubmitActions(activeFields).map(
            async (f) => await f({ state, dispatch, api: api() })
          )
        )
      ).pop() || state.questionaryId; // TODO obtain newly created questionary ID some other way

    if (!questionaryId) {
      return false;
    }

    const answerTopicResult = await api('Saved').answerTopic({
      questionaryId: questionaryId,
      answers: prepareAnswers(activeFields),
      topicId: topicId,
      isPartialSave: isPartialSave,
    });

    if (answerTopicResult.answerTopic.questionaryStep) {
      dispatch({
        type: 'STEP_ANSWERED',
        step: answerTopicResult.answerTopic.questionaryStep,
      });

      setLastSavedFormValues(initialValues);
    } else if (answerTopicResult.answerTopic.rejection) {
      return false;
    }

    return true;
  };

  const backHandler = () => {
    if (state.isDirty) {
      if (
        window.confirm(
          'Changes you recently made in this step will not be saved! Are you sure?'
        )
      ) {
        dispatch({ type: 'BACK_CLICKED' });
      }
    } else {
      dispatch({ type: 'BACK_CLICKED' });
    }
  };

  const resetHandler = () => dispatch({ type: 'RESET_CLICKED' });

  const saveHandler = () => performSave(true);

  if (state === null || !questionaryStep) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={() => {}}
      enableReinitialize={true}
    >
      {(formikProps) => {
        const {
          submitForm,
          validateForm,
          setFieldValue,
          isSubmitting,
          setSubmitting,
        } = formikProps;

        return (
          <form className={readOnly ? classes.disabled : undefined}>
            <PromptIfDirty isDirty={state.isDirty} />
            {activeFields.map((field) => {
              return (
                <div
                  className={classes.componentWrapper}
                  key={field.question.id}
                >
                  {createQuestionaryComponent({
                    answer: field,
                    formikProps,
                    onComplete: (newValue: Answer['value']) => {
                      if (field.value !== newValue) {
                        dispatch({
                          type: 'FIELD_CHANGED',
                          id: field.question.id,
                          newValue: newValue,
                        });
                        setFieldValue(field.question.id, newValue, true);
                      }
                    },
                  })}
                </div>
              );
            })}
            <NavigationFragment disabled={readOnly} isLoading={isSubmitting}>
              <NavigButton
                onClick={backHandler}
                disabled={state.stepIndex === 0}
              >
                Back
              </NavigButton>
              <NavigButton
                onClick={resetHandler}
                disabled={state.isDirty === false}
              >
                Reset
              </NavigButton>
              {!questionaryStep.isCompleted && (
                <NavigButton
                  onClick={saveHandler}
                  disabled={!state.isDirty}
                  isBusy={isSubmitting}
                  variant="contained"
                  color="primary"
                  data-cy="save-button"
                >
                  Save
                </NavigButton>
              )}
              <NavigButton
                onClick={() => {
                  submitFormAsync(submitForm, validateForm).then(
                    async (isValid: boolean) => {
                      if (isValid) {
                        const goNextStep = await performSave(false);
                        if (!goNextStep) {
                          setSubmitting(false);

                          return;
                        }

                        dispatch({ type: 'GO_STEP_FORWARD' });
                        props.onStepComplete?.(topicId);
                      }
                    }
                  );
                }}
                isBusy={isSubmitting}
                variant="contained"
                color="primary"
                data-cy="save-and-continue-button"
              >
                Save and continue
              </NavigButton>
            </NavigationFragment>
            <ErrorFocus />
          </form>
        );
      }}
    </Formik>
  );
}
