/* eslint-disable @typescript-eslint/no-use-before-define */
import { Typography } from '@material-ui/core';
import { default as React, useState } from 'react';

import Questionary from 'components/questionary/Questionary';
import {
  QuestionaryContext,
  QuestionaryContextType,
} from 'components/questionary/QuestionaryContext';
import { TemplateGroupId } from 'generated/sdk';
import createCustomEventHandlers from 'models/questionary/createCustomEventHandlers';
import { ProposalSubmissionState } from 'models/questionary/proposal/ProposalSubmissionState';
import { ProposalWithQuestionary } from 'models/questionary/proposal/ProposalWithQuestionary';
import {
  Event,
  QuestionarySubmissionModel,
} from 'models/questionary/QuestionarySubmissionState';
import useEventHandlers from 'models/questionary/useEventHandlers';
import { ContentContainer, StyledPaper } from 'styles/StyledComponents';

export interface ProposalContextType extends QuestionaryContextType {
  state: ProposalSubmissionState | null;
}

export default function ProposalContainer(props: {
  proposal: ProposalWithQuestionary;
  proposalUpdated?: (proposal: ProposalWithQuestionary) => void;
}) {
  const [initialState] = useState(new ProposalSubmissionState(props.proposal));

  const eventHandlers = useEventHandlers(TemplateGroupId.PROPOSAL);

  const customEventHandlers = createCustomEventHandlers(
    (state: ProposalSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          props.proposalUpdated?.({
            ...state.proposal,
            ...action.itemWithQuestionary,
          });
          break;
      }
    }
  );

  const { state, dispatch } = QuestionarySubmissionModel(initialState, [
    eventHandlers,
    customEventHandlers,
  ]);

  const hasReferenceNumberFormat = !!state.proposal.call?.referenceNumberFormat;

  const { submitted, proposalId } = state.proposal;

  let info: JSX.Element | string = proposalId || 'DRAFT';

  if (!submitted && hasReferenceNumberFormat && proposalId) {
    info = (
      <Typography>
        {proposalId} <br /> <small>Pre-submission reference</small>
      </Typography>
    );
  }

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <ContentContainer maxWidth="md">
        <StyledPaper>
          <Questionary
            title={state.proposal.title || 'New Proposal'}
            info={info}
          />
        </StyledPaper>
      </ContentContainer>
    </QuestionaryContext.Provider>
  );
}
