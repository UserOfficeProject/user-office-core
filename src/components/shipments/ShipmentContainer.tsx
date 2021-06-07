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
import {
  Event,
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
    case 'SHIPMENT_CREATED':
    case 'SHIPMENT_LOADED':
      const shipment: ShipmentExtended = action.shipment;
      draftState.isDirty = false;
      draftState.questionaryId = shipment.questionaryId;
      draftState.shipment = shipment;
      draftState.steps = shipment.questionary.steps;
      draftState.templateId = shipment.questionary.templateId;
      break;
    case 'SHIPMENT_MODIFIED':
      draftState.shipment = {
        ...draftState.shipment,
        ...action.shipment,
      };
      draftState.isDirty = true;
      break;
    case 'STEPS_LOADED': {
      draftState.shipment.questionary.steps = action.steps;
      break;
    }
    case 'STEP_ANSWERED':
      const updatedStep = action.step;
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

    return {
      title: 'Review',
      isCompleted: isShipmentSubmitted(shipmentState.shipment),
      isReadonly: false,
    };
  },
});
export default function ShipmentContainer(props: {
  shipment: ShipmentExtended;
  done?: (shipment: ShipmentExtended) => void;
}) {
  const { api } = useDataApiWithFeedback();

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
            onStepComplete={() => {
              props.done?.(state.shipment);
            }}
          />
        );
      case 'ShipmentReview':
        return (
          <ShipmentReview onComplete={() => props.done?.(state.shipment)} />
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
        type: 'SHIPMENT_LOADED',
        shipment: initialState.shipment,
      });
    } else {
      await api()
        .getShipment({ shipmentId: shipmentState.shipment.id }) // or load blankQuestionarySteps if sample is null
        .then((data) => {
          if (data.shipment && data.shipment.questionary.steps) {
            dispatch({
              type: 'SHIPMENT_LOADED',
              shipment: data.shipment,
            });
            dispatch({
              type: 'STEPS_LOADED',
              steps: data.shipment.questionary.steps,
              stepIndex: state.stepIndex,
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
        case 'BACK_CLICKED': // move this
          if (!state.isDirty || (await handleReset())) {
            dispatch({ type: 'GO_STEP_BACK' });
          }
          break;

        case 'RESET_CLICKED':
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
    [handleEvents],
    shipmentReducer
  );

  useEffect(() => {
    const isComponentMountedForTheFirstTime =
      previousInitialShipment === undefined;
    if (isComponentMountedForTheFirstTime) {
      dispatch({
        type: 'SHIPMENT_LOADED',
        shipment: props.shipment,
      });
      dispatch({
        type: 'STEPS_LOADED',
        steps: props.shipment.questionary.steps,
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
