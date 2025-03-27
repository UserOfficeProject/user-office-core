/* eslint-disable @typescript-eslint/no-use-before-define */
import { PaperProps } from '@mui/material';
import { default as React, useState } from 'react';

import { QuestionaryContext } from 'components/questionary/QuestionaryContext';
import { QuestionarySubmissionModel } from 'models/questionary/QuestionarySubmissionState';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

interface ExperimentSafetyContainerProps {
  previewMode?: boolean;
  elevation?: PaperProps['elevation'];
}

export default function ExperimentSafetyContainer(
  props: ExperimentSafetyContainerProps
) {
  const { elevation, previewMode } = props;

  const [initialState] = useState({});
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
      <StyledContainer>
        <StyledPaper elevation={elevation}>
          {/* <Questionary
            title={state.proposal.title || 'New Proposal'}
            info={info}
            previewMode={previewMode}
          /> */}
          asdasd
        </StyledPaper>
      </StyledContainer>
    </QuestionaryContext.Provider>
  );
}
