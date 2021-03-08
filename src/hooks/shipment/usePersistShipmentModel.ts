import { ShipmentStatus } from 'generated/sdk';
import { ShipmentSubmissionState } from 'models/ShipmentSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';
import { FunctionType } from 'utils/utilTypes';

import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from '../../models/QuestionarySubmissionState';

export function usePersistShipmentModel() {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: FunctionType) => async (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.SHIPMENT_SUBMIT_CLICKED: {
          api('Saved')
            .updateShipment({
              shipmentId: (getState() as ShipmentSubmissionState).shipment.id,
              status: ShipmentStatus.SUBMITTED,
            })
            .then((result) => {
              const state = getState() as ShipmentSubmissionState;
              dispatch({
                type: EventType.SHIPMENT_LOADED,
                payload: {
                  shipment: {
                    ...state.shipment,
                    ...result.updateShipment.shipment,
                  },
                },
              });
            });
          break;
        }
      }
    };
  };

  return { isSavingModel: isExecutingCall, persistModel };
}
