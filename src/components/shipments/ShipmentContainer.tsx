/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useEffect } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { getQuestionaryDefinition } from 'components/questionary/QuestionaryRegistry';
import { TemplateGroupId } from 'generated/sdk';
import { usePrevious } from 'hooks/common/usePrevious';
import {
  Event,
  QuestionarySubmissionModel,
  QuestionarySubmissionState,
} from 'models/questionary/QuestionarySubmissionState';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';
import { ShipmentSubmissionState } from 'models/questionary/shipment/ShipmentSubmissionState';
import { ShipmentWithQuestionary } from 'models/questionary/shipment/ShipmentWithQuestionary';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

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
      const shipment: ShipmentWithQuestionary = action.shipment;
      draftState.isDirty = false;
      draftState.itemWithQuestionary = shipment;
      break;
    case 'SHIPMENT_MODIFIED':
      draftState.shipment = {
        ...draftState.shipment,
        ...action.shipment,
      };
      draftState.isDirty = true;
      break;
  }

  return draftState;
};

export default function ShipmentContainer(props: {
  shipment: ShipmentWithQuestionary;
  onShipmentSubmitted?: (shipment: ShipmentCore) => void;
}) {
  const { api } = useDataApiWithFeedback();

  const previousInitialShipment = usePrevious(props.shipment);

  const def = getQuestionaryDefinition(TemplateGroupId.SHIPMENT);

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

        case 'SHIPMENT_SUBMITTED':
          props.onShipmentSubmitted?.(state.shipment);
          break;
      }
    };
  };
  const initialState = new ShipmentSubmissionState(
    props.shipment,
    0,
    false,
    def.wizardStepFactory.getWizardSteps(props.shipment.questionary.steps)
  );
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
        displayElementFactory={def.displayElementFactory}
      />
    </QuestionaryContext.Provider>
  );
}
