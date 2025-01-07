import Box from '@mui/material/Box';
import { Formik } from 'formik';
import React, { useContext, useEffect, useState } from 'react';
import * as Yup from 'yup';

import { ErrorFocus } from 'components/common/ErrorFocus';
import { NavigButton } from 'components/common/NavigButton';
import PromptIfDirty from 'components/common/PromptIfDirty';
import UOLoader from 'components/common/UOLoader';
import GradeGuidePage from 'components/pages/GradeGuidePage';
import { Answer, QuestionaryStep, Sdk } from 'generated/sdk';
import ButtonWithDialog from 'hooks/common/ButtonWithDialog';
import { useFapData } from 'hooks/fap/useFapData';
import { usePreSubmitActions } from 'hooks/questionary/useSubmitActions';
import { FapReviewSubmissionState } from 'models/questionary/fapReview/FapReviewSubmissionState';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import {
  areDependenciesSatisfied,
  getQuestionaryStepByTopicId as getStepByTopicId,
  prepareAnswers,
} from 'models/questionary/QuestionaryFunctions';
import { QuestionarySubmissionState } from 'models/questionary/QuestionarySubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import withConfirm, { WithConfirmType } from 'utils/withConfirm';

import NavigationFragment from './NavigationFragment';
import {
  createQuestionaryComponent,
  getQuestionaryComponentDefinition,
} from './QuestionaryComponentRegistry';
import {
  createMissingContextErrorMessage,
  QuestionaryContext,
} from './QuestionaryContext';

export const createFormikConfigObjects = (
  answers: Answer[],
  state: QuestionarySubmissionState,
  api: () => Sdk
): {
  validationSchema: Record<string, Yup.AnySchema>;
  initialValues: Record<string, unknown>;
} => {
  const validationSchema: Record<string, Yup.AnySchema> = {};
  const initialValues: Record<string, unknown> = {};

  answers.forEach((answer) => {
    const definition = getQuestionaryComponentDefinition(
      answer.question.dataType
    );
    if (definition.createYupValidationSchema) {
      validationSchema[answer.question.id] =
        definition.createYupValidationSchema(answer, state, api);
      initialValues[answer.question.id] = definition.getYupInitialValue({
        answer,
        state,
      });
    }
  });

  return {
    initialValues,
    validationSchema,
  };
};

function QuestionaryStepView(props: {
  topicId: number;
  readonly: boolean;
  onStepComplete?: (topicId: number) => void;
  confirm: WithConfirmType;
}) {
  const { topicId, confirm } = props;

  const preSubmitActions = usePreSubmitActions();
  const { api } = useDataApiWithFeedback();

  const { state, dispatch } = useContext(QuestionaryContext);

  const [isProposalSubmitted] = useState(
    () => (state as ProposalSubmissionState)?.proposal?.submitted ?? false
  );

  const [fapId] = useState(
    () => (state as FapReviewSubmissionState)?.fapReview?.fapID ?? 0
  );

  const { fap } = useFapData(fapId);

  if (!state || !dispatch) {
    throw new Error(createMissingContextErrorMessage());
  }

  const questionaryStep = getStepByTopicId(state.questionary.steps, topicId) as
    | QuestionaryStep
    | undefined;

  if (!questionaryStep) {
    throw new Error(
      `Could not find questionary step with topic id: ${topicId}`
    );
  }

  const activeFields = questionaryStep.fields.filter((field) => {
    return areDependenciesSatisfied(state.questionary.steps, field.question.id);
  });

  const { initialValues, validationSchema } = createFormikConfigObjects(
    activeFields,
    state,
    api
  );

  const [lastSavedFormValues, setLastSavedFormValues] = useState(initialValues);
  const [isSaving, setIsSaving] = useState(false);

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

  const actionsTemplateChanges = () => {
    const promises = [];

    for (let i = 0; i < state.deletedTemplates.length; i++) {
      promises.push(
        api().deleteGenericTemplate({
          genericTemplateId: state.deletedTemplates[i],
        })
      );
    }

    Promise.all(promises).then(() => {
      dispatch({ type: 'CLEAR_DELETE_LIST' });
      dispatch({ type: 'CLEAR_CREATED_LIST' });
    });
  };

  const performSave = async (isPartialSave: boolean): Promise<boolean> => {
    setIsSaving(true);

    actionsTemplateChanges();

    let questionaryId;
    try {
      questionaryId =
        (
          await Promise.all(
            preSubmitActions(activeFields).map(
              async (f) => await f({ state, dispatch, api: api() })
            )
          )
        ).pop() || state.questionary.questionaryId; // TODO obtain newly created questionary ID some other way

      if (!questionaryId) {
        setIsSaving(false);

        return false;
      }
    } catch (error) {
      setIsSaving(false);

      throw error;
    }

    try {
      const { answerTopic } = await api({
        toastSuccessMessage: isProposalSubmitted
          ? 'Saved and proposal resubmitted'
          : 'Saved',
      }).answerTopic({
        questionaryId: questionaryId,
        answers: prepareAnswers(activeFields),
        topicId: topicId,
        isPartialSave: isPartialSave,
      });

      dispatch({
        type: 'STEP_ANSWERED',
        answers: answerTopic,
        topicId: topicId,
        isPartialSave: isPartialSave,
      });

      setLastSavedFormValues(initialValues);
    } catch (error) {
      return false;
    } finally {
      setIsSaving(false);
    }

    return true;
  };

  const revertTemplateChanges = () => {
    const promises = [];

    for (let i = 0; i < state.createdTemplates.length; i++) {
      promises.push(
        api().deleteGenericTemplate({
          genericTemplateId: state.createdTemplates[i],
        })
      );
    }
    Promise.all(promises).then(() => {
      dispatch({ type: 'CLEAR_CREATED_LIST' });
      dispatch({ type: 'CLEAR_DELETE_LIST' });
      dispatch({ type: 'RESET_CLICKED' });
    });
  };

  const backHandler = () =>
    dispatch({
      type: 'BACK_CLICKED',
      confirm,
    });

  const resetHandler = () => {
    confirm?.(
      () => {
        revertTemplateChanges();
      },
      {
        title: 'Confirmation',
        description:
          'You have made changes in this step, which will be discarded. Are you sure?',
      }
    )();
  };

  const saveHandler = () => performSave(true);

  if (state === null || !questionaryStep) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape(validationSchema)}
      onSubmit={async () => {
        const isSaveSuccess = await performSave(false);

        if (isSaveSuccess) {
          dispatch({ type: 'GO_STEP_FORWARD' });
          props.onStepComplete?.(topicId);
        }
      }}
      enableReinitialize={true}
    >
      {(formikProps) => {
        const { submitForm, setFieldValue, isSubmitting } = formikProps;

        return (
          <form
            style={{
              ...(props.readonly && { pointerEvents: 'none', opacity: 0.7 }),
            }}
          >
            <PromptIfDirty isDirty={state.isDirty} />
            {activeFields.map((field) => {
              return (
                <Box
                  sx={(theme) => ({ margin: theme.spacing(2, 0, 0, 0) })}
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
                </Box>
              );
            })}
            <NavigationFragment
              disabled={props.readonly}
              isLoading={isSubmitting}
            >
              {state.stepIndex == 0 && fapId != 0 && (
                <ButtonWithDialog
                  label="Grading guide"
                  disabled={isSubmitting}
                  data-cy="grade-guide"
                  title="Grading Guide"
                >
                  {fap ? <GradeGuidePage fap={fap} /> : <GradeGuidePage />}
                </ButtonWithDialog>
              )}
              <NavigButton
                onClick={backHandler}
                disabled={state.stepIndex === 0}
              >
                Back
              </NavigButton>
              <NavigButton onClick={resetHandler} disabled={!state.isDirty}>
                Reset
              </NavigButton>
              {!questionaryStep.isCompleted && (
                <NavigButton
                  onClick={saveHandler}
                  disabled={!state.isDirty || isSaving}
                  isBusy={isSaving}
                  data-cy="save-button"
                >
                  Save
                </NavigButton>
              )}
              <NavigButton
                onClick={submitForm}
                isBusy={isSubmitting}
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

export default withConfirm(QuestionaryStepView);
