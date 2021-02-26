/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import QuestionaryStepView from 'components/questionary/QuestionaryStepView';
import { QuestionaryStep, ShipmentStatus } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import { usePersistShipmentModel } from 'hooks/shipment/usePersistShipmentModel';
import {
  Event,
  EventType,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
  WizardStep,
} from 'models/QuestionarySubmissionState';
import {
  ShipmentExtended,
  ShipmentSubmissionState,
} from 'models/ShipmentSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import ShipmentReview from './ShipmentReview';

export interface ShipmentContextType extends QuestionaryContextType {
  state: ShipmentSubmissionState | null;
}

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
    case EventType.QUESTIONARY_STEPS_LOADED: {
      draftState.shipment.questionary.steps = action.payload.questionarySteps;
      break;
    }
    case EventType.QUESTIONARY_STEP_ANSWERED:
      const updatedStep = action.payload.questionaryStep as QuestionaryStep;
      const stepIndex = draftState.shipment.questionary.steps.findIndex(
        (step) => step.topic.id === updatedStep.topic.id
      );
      draftState.shipment.questionary.steps[stepIndex] = updatedStep;

      break;
  }

  return draftState;
};

const isShipmentSubmitted = (shipment: { status: ShipmentStatus }) =>
  shipment.status === ShipmentStatus.SUBMITTED;

const createQuestionaryWizardStep = (
  step: QuestionaryStep,
  index: number
): WizardStep => ({
  type: 'QuestionaryStep',
  payload: { topicId: step.topic.id, questionaryStepIndex: index },
  getMetadata: (state, payload) => {
    const shipmentState = state as ShipmentSubmissionState;
    const questionaryStep = state.steps[payload.questionaryStepIndex];

    return {
      title: questionaryStep.topic.title,
      isCompleted: questionaryStep.isCompleted,
      isReadonly:
        isShipmentSubmitted(shipmentState.shipment) ||
        (index > 0 && state.steps[index - 1].isCompleted === false),
    };
  },
});

const createReviewWizardStep = (): WizardStep => ({
  type: 'ShipmentReview',
  getMetadata: (state) => {
    const shipmentState = state as ShipmentSubmissionState;
    const lastShipmentStep = shipmentState.steps[state.steps.length - 1];

    return {
      title: 'Review',
      isCompleted: isShipmentSubmitted(shipmentState.shipment),
      isReadonly:
        isShipmentSubmitted(shipmentState.shipment) ||
        lastShipmentStep.isCompleted === false,
    };
  },
});
export default function ShipmentContainer(props: {
  shipment: ShipmentExtended;
  done?: (shipment: ShipmentExtended) => void;
}) {
  const { api } = useDataApiWithFeedback();
  const { persistModel: persistShipmentModel } = usePersistShipmentModel();

  const previousInitialShipment = usePrevious(props.shipment);

  const createShipmentWizardSteps = (): WizardStep[] => {
    const wizardSteps: WizardStep[] = [];
    const questionarySteps = props.shipment.questionary.steps;

    questionarySteps.forEach((step, index) =>
      wizardSteps.push(createQuestionaryWizardStep(step, index))
    );

    wizardSteps.push(createReviewWizardStep());

    return wizardSteps;
  };

  const displayElementFactory = (metadata: WizardStep, isReadonly: boolean) => {
    switch (metadata.type) {
      case 'QuestionaryStep':
        return (
          <QuestionaryStepView
            readonly={isReadonly}
            topicId={metadata.payload.topicId}
          />
        );
      case 'ShipmentReview':
        return (
          <ShipmentReview
            isReadonly={isReadonly}
            onComplete={() => props.done?.(state.shipment)}
          />
        );

      default:
        throw new Error(`Unknown step type ${metadata.type}`);
    }
  };

  /**
   * Returns true if reset was performed, false otherwise
   */
  const handleReset = async (): Promise<boolean> => {
    const shipmentState = state as ShipmentSubmissionState;

    if (shipmentState.shipment.id === 0) {
      // if shipment is not created yet
      dispatch({
        type: EventType.SHIPMENT_LOADED,
        payload: { shipment: initialState.shipment },
      });
    } else {
      await api()
        .getShipment({ shipmentId: shipmentState.shipment.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.shipment && data.shipment.questionary.steps) {
            dispatch({
              type: EventType.SHIPMENT_LOADED,
              payload: { shipment: data.shipment },
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
  };

  const handleEvents = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: FunctionType) => async (action: Event) => {
      next(action); // first update state/model
      const state = getState() as ShipmentSubmissionState;
      switch (action.type) {
        case EventType.SHIPMENT_DONE:
          props.done?.(action.payload.shipment);
          break;

        case EventType.BACK_CLICKED: // move this
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
    wizardSteps: createShipmentWizardSteps(),
  };

  const {
    state,
    dispatch,
  } = QuestionarySubmissionModel<ShipmentSubmissionState>(
    initialState,
    [handleEvents, persistShipmentModel],
    shipmentReducer
  );

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

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.shipment.title || 'New Shipment'}
        info={state.shipment.status}
        handleReset={handleReset}
        displayElementFactory={displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
