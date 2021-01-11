/* eslint-disable @typescript-eslint/no-use-before-define */
import LinearProgress from '@material-ui/core/LinearProgress';
import Step from '@material-ui/core/Step';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { default as React, useEffect } from 'react';
import { Prompt } from 'react-router';

import { useCheckAccess } from 'components/common/Can';
import NavigationFragment from 'components/questionary/NavigationFragment';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { QuestionaryStepButton } from 'components/questionary/QuestionaryStepButton';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import {
  Questionary,
  QuestionaryStep,
  ShipmentStatus,
  UserRole,
} from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import { usePersistQuestionaryModel } from 'hooks/questionary/usePersistQuestionaryModel';
import { usePersistShipmentModel } from 'hooks/shipment/usePersistShipmentModel';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/QuestionarySubmissionState';
import {
  ShipmentExtended,
  ShipmentSubmissionState,
} from 'models/ShipmentSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

const useStyles = makeStyles(theme => ({
  stepper: {
    padding: theme.spacing(3, 0, 5),
  },
  heading: {
    textOverflow: 'ellipsis',
    width: '80%',
    margin: '0 auto',
    textAlign: 'center',
    minWidth: '450px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  infoline: {
    color: theme.palette.grey[600],
    textAlign: 'right',
  },
}));

type ShipmentContextType = {
  state: ShipmentSubmissionState | null;
  dispatch: React.Dispatch<Event>;
};

export const ShipmentContext = React.createContext<ShipmentContextType>({
  state: null,
  dispatch: (e: Event) => {},
});

const getReviewStepIndex = (state: ShipmentSubmissionState) =>
  state.steps.length;

const getConfirmNavigMsg = (): string => {
  return 'Changes you recently made in this step will not be saved! Are you sure?';
};

const shipmentReducer = (
  state: ShipmentSubmissionState,
  draftState: ShipmentSubmissionState,
  action: Event
) => {
  switch (action.type) {
    case EventType.SHIPMENT_CREATED:
    case EventType.SHIPMENT_LOADED:
      const shipment: ShipmentExtended = action.payload.shipment;
      draftState.isDirty = false;
      draftState.questionaryId = shipment.questionaryId;
      draftState.shipment = shipment;
      draftState.steps = shipment.questionary.steps;
      draftState.templateId = shipment.questionary.templateId;
      break;
    case EventType.SHIPMENT_MODIFIED:
      draftState.shipment = {
        ...draftState.shipment,
        ...action.payload.shipment,
      };
      draftState.isDirty = true;
      break;
    case EventType.GO_TO_STEP:
      const reviewStepIdx = getReviewStepIndex(state);
      if (action.payload.stepIndex === reviewStepIdx) {
        draftState.stepIndex = reviewStepIdx;
      }
      break;

    case EventType.QUESTIONARY_STEPS_COMPLETE: {
      draftState.stepIndex = getReviewStepIndex(state);
      break;
    }
    case EventType.QUESTIONARY_STEPS_LOADED: {
      draftState.shipment.questionary.steps = action.payload.questionarySteps;
      break;
    }
    case EventType.QUESTIONARY_STEP_ANSWERED: // THIS should be part of questionary reducer?
      const updatedStep = action.payload.questionaryStep as QuestionaryStep;
      const stepIndex = draftState.shipment.questionary.steps.findIndex(
        step => step.topic.id === updatedStep.topic.id
      );
      draftState.shipment.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

export default function ShipmentContainer(props: {
  shipment: ShipmentExtended;
  done?: (shipment: ShipmentExtended) => any;
}) {
  const isNonOfficer = !useCheckAccess([UserRole.USER_OFFICER]);

  const classes = useStyles();
  const { api, isExecutingCall: isApiInteracting } = useDataApiWithFeedback();
  const { persistModel, isSavingModel } = usePersistQuestionaryModel();
  const {
    persistModel: persistShipmentModel,
    isSavingModel: isSavingShipmentModel,
  } = usePersistShipmentModel();
  const previousInitialShipment = usePrevious(props.shipment);

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    if (state.isDirty) {
      const confirmed = window.confirm(getConfirmNavigMsg());
      const shipmentState = state as ShipmentSubmissionState;
      if (confirmed) {
        if (shipmentState.shipment.id === 0) {
          // if shipment is not created yet
          dispatch({
            type: EventType.SHIPMENT_LOADED,
            payload: { shipment: initialState.shipment },
          });
        } else {
          await api()
            .getShipment({ shipmentId: shipmentState.shipment.id }) // or load blankQuestionarySteps if sample is null
            .then(data => {
              if (data.shipment && data.shipment.questionary.steps) {
                dispatch({
                  type: EventType.SHIPMENT_LOADED,
                  payload: { proposal: data.shipment },
                });
                dispatch({
                  type: EventType.QUESTIONARY_STEPS_LOADED,
                  payload: {
                    questionarySteps: data.shipment.questionary.steps,
                    stepIndex: state.stepIndex,
                  },
                });
              }
            });
        }

        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const allStepsComplete = (questionary: Questionary) =>
    questionary && questionary.steps.every(step => step.isCompleted);

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState() as ShipmentSubmissionState;
      switch (action.type) {
        case EventType.SHIPMENT_DONE:
          props.done?.(action.payload.shipment);
          break;
        case EventType.BACK_CLICKED:
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: EventType.GO_STEP_BACK });
          }
          break;

        case EventType.RESET_CLICKED:
          handleReset();
          break;
      }
    };
  };
  const initialState: ShipmentSubmissionState = {
    shipment: props.shipment,
    templateId: props.shipment.questionary.templateId,
    isDirty: false,
    questionaryId: props.shipment.questionary.questionaryId,
    stepIndex: 0,
    steps: props.shipment.questionary.steps,
  };

  const { state, dispatch } = QuestionarySubmissionModel<
    ShipmentSubmissionState
  >(
    initialState,
    [handleEvents, persistModel, persistShipmentModel],
    shipmentReducer
  );

  const isSubmitted = state.shipment.status === ShipmentStatus.SUBMITTED;

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialShipment === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: EventType.SHIPMENT_LOADED,
        payload: { shipment: props.shipment },
      });
      dispatch({
        type: EventType.QUESTIONARY_STEPS_LOADED,
        payload: { questionarySteps: props.shipment.questionary.steps },
      });
    }
  }, [previousInitialShipment, props.shipment, dispatch]);

  const getStepperNavig = () => {
    if (state.steps.length <= 1) {
      return null;
    }

    return (
      <Stepper
        nonLinear
        activeStep={state.stepIndex}
        className={classes.stepper}
      >
        {state.steps.map((step, index, steps) => (
          <Step key={index}>
            <QuestionaryStepButton
              onClick={async () => {
                if (!state.isDirty || (await handleReset())) {
                  dispatch({
                    type: EventType.GO_TO_STEP,
                    payload: { stepIndex: index },
                  });
                }
              }}
              completed={step.isCompleted}
              editable={
                index === 0 ||
                step.isCompleted ||
                steps[index].isCompleted === true
              }
            >
              <span>{step.topic.title}</span>
            </QuestionaryStepButton>
          </Step>
        ))}
        <Step key="review">
          <QuestionaryStepButton
            onClick={async () => {
              dispatch({
                type: EventType.GO_TO_STEP,
                payload: { stepIndex: state.steps.length },
              });
            }}
            completed={isSubmitted}
            editable={allStepsComplete(state.shipment.questionary)}
          >
            <span>Review</span>
          </QuestionaryStepButton>
        </Step>
      </Stepper>
    );
  };

  const getStepContent = () => {
    if (state.stepIndex === getReviewStepIndex(state)) {
      return (
        <div>
          <QuestionaryDetails questionaryId={state.shipment.questionaryId} />
          <div>
            <NavigationFragment
              back={undefined}
              saveAndNext={{
                callback: () =>
                  dispatch({
                    type: EventType.SHIPMENT_DONE,
                    payload: { shipment: state.shipment },
                  }),
                label: 'Finish',
              }}
              reset={undefined}
              isLoading={false}
            />
          </div>
        </div>
      );
    }
    const currentStep = state.steps[state.stepIndex];
    const previousStep = state.steps[state.stepIndex - 1];

    if (!currentStep) {
      return null;
    }

    return (
      <QuestionaryStepView
        topicId={currentStep.topic.id}
        state={state}
        readonly={
          isApiInteracting ||
          (previousStep ? previousStep.isCompleted === false : false) ||
          (isSubmitted && isNonOfficer)
        }
        dispatch={dispatch}
        key={currentStep.topic.id}
      />
    );
  };

  const getProgressBar = () =>
    isApiInteracting || isSavingModel || isSavingShipmentModel ? (
      <LinearProgress />
    ) : null;

  return (
    <ShipmentContext.Provider value={{ state, dispatch }}>
      <Prompt when={state.isDirty} message={() => getConfirmNavigMsg()} />

      <Typography
        component="h1"
        variant="h4"
        align="center"
        className={classes.heading}
      >
        {state.shipment.title || 'New Proposal'}
      </Typography>
      <div className={classes.infoline}>{state.shipment.status}</div>
      {getStepperNavig()}
      {getProgressBar()}
      {getStepContent()}
    </ShipmentContext.Provider>
  );
}
