/* eslint-disable @typescript-eslint/no-use-before-define */
import { default as React, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { TemplateGroupId } from 'generated/sdk';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import { QuestionarySubmissionModel } from 'models/questionary/QuestionarySubmissionState';
import { ShipmentCore } from 'models/questionary/shipment/ShipmentCore';
import { ShipmentSubmissionState } from 'models/questionary/shipment/ShipmentSubmissionState';
import { ShipmentWithQuestionary } from 'models/questionary/shipment/ShipmentWithQuestionary';
import useEventHandlers from 'models/questionary/useEventHandlers';

export interface ShipmentContextType extends QuestionaryContextType {
  state: ShipmentSubmissionState | null;
}

export default function ShipmentContainer(props: {
  shipment: ShipmentWithQuestionary;
  onShipmentSubmitted?: (shipment: ShipmentCore) => void;
  onShipmentCreated?: (shipment: ShipmentCore) => void;
}) {
  const [initialState] = useState(new ShipmentSubmissionState(props.shipment));
  const eventHandlers = useEventHandlers(TemplateGroupId.SHIPMENT);
  const customEventHandlers =
    createCustomEventHandlers<ShipmentSubmissionState>((state, action) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_SUBMITTED':
          props.onShipmentSubmitted?.(state.shipment);
          break;
        case 'ITEM_WITH_QUESTIONARY_CREATED':
          props.onShipmentCreated?.(state.shipment);
          break;
      }
    });

  const { state, dispatch } = QuestionarySubmissionModel(initialState, [
    eventHandlers,
    customEventHandlers,
  ]);

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <Questionary
        title={state.shipment.title || 'New Shipment'}
        info={state.shipment.status}
      />
    </QuestionaryContext.Provider>
  );
}
