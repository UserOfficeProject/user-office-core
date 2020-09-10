import makeStyles from '@material-ui/core/styles/makeStyles';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { Formik } from 'formik';
import React, { SyntheticEvent } from 'react';
import * as Yup from 'yup';

import { NavigButton } from 'components/common/NavigButton';
import { createFormikConfigObjects } from 'components/proposal/createFormikConfigObjects';
import { Questionary } from 'generated/sdk';
import { usePersistSubquestionaryModel } from 'hooks/questionary/usePersistSubquestionaryModel';
import { areDependenciesSatisfied } from 'models/ProposalModelFunctions';
import {
  Event,
  EventType,
  SubquestionarySubmissionModel,
} from 'models/SubquestionarySubmissionModel';
import submitFormAsync from 'utils/FormikAsyncFormHandler';

import { QuestionaryComponentFactory } from './QuestionaryComponentFactory';

export function SubquestionarySubmissionContainer(props: {
  questionary: Questionary;
  questionaryEditDone?: () => void;
}) {
  function handleEvents() {
    return (next: Function) => async (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.CANCEL_CLICKED:
        case EventType.MODEL_SAVED:
          props.questionaryEditDone?.();
          break;
      }
    };
  }

  const { isSavingModel, persistModel } = usePersistSubquestionaryModel();
  const { state, dispatch } = SubquestionarySubmissionModel(
    {
      isDirty: false,
      questionary: props.questionary,
    },
    [handleEvents, persistModel]
  );

  const classes = makeStyles(theme => ({
    componentWrapper: {
      margin: '10px 0',
    },
    button: {
      marginLeft: theme.spacing(1),
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '100%',
      marginTop: theme.spacing(5),
    },
  }))();

  const componentFactory = new QuestionaryComponentFactory();
  const questionaryStep = state.questionary.steps[0]; // Take only first step for now
  if (!questionaryStep) {
    return null;
  }

  const activeFields = questionaryStep
    ? questionaryStep.fields.filter(field => {
        return areDependenciesSatisfied(
          state.questionary.steps,
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
      {({ errors, touched, handleChange, submitForm, validateForm }) => (
        <form style={{ width: '100%' }}>
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
                  },
                })}
              </div>
            );
          })}

          <div className={classes.buttonContainer}>
            <NavigButton
              onClick={() => dispatch({ type: EventType.CANCEL_CLICKED })}
              type="button"
              color="primary"
              startIcon={<CloseIcon />}
              className={classes.button}
            >
              Cancel
            </NavigButton>
            <NavigButton
              onClick={() =>
                submitFormAsync(submitForm, validateForm).then(
                  (isValid: boolean) => {
                    if (isValid) {
                      dispatch({ type: EventType.SAVE_CLICKED });
                    }
                  }
                )
              }
              type="button"
              variant="contained"
              color="primary"
              startIcon={<CheckIcon />}
              className={classes.button}
              isbusy={isSavingModel}
              data-cy="save-button"
            >
              Update
            </NavigButton>
          </div>
        </form>
      )}
    </Formik>
  );
}
