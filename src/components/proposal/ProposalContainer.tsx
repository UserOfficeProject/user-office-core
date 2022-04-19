/* eslint-disable @typescript-eslint/no-use-before-define */
import { PaperProps, Typography } from '@mui/material';
import { default as React, useState } from 'react';

import CopyToClipboard from 'components/common/CopyToClipboard';
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
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';

export interface ProposalContextType extends QuestionaryContextType {
  state: ProposalSubmissionState | null;
}

interface ProposalContainerProps {
  proposal: ProposalWithQuestionary;
  proposalUpdated?: (proposal: ProposalWithQuestionary) => void;
  elevation?: PaperProps['elevation'];
}
export default function ProposalContainer(props: ProposalContainerProps) {
  const { proposal, proposalUpdated, elevation } = props;

  const [initialState] = useState(new ProposalSubmissionState(proposal));

  const eventHandlers = useEventHandlers(TemplateGroupId.PROPOSAL);

  const customEventHandlers = createCustomEventHandlers(
    (state: ProposalSubmissionState, action: Event) => {
      switch (action.type) {
        case 'ITEM_WITH_QUESTIONARY_MODIFIED':
          proposalUpdated?.({
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

  let info: JSX.Element | string =
    (
      <CopyToClipboard
        text={proposalId}
        successMessage={`'${proposalId}' copied to clipboard`}
      >
        {proposalId ? `Proposal ID: ${proposalId}` : ''}
      </CopyToClipboard>
    ) || 'DRAFT';

  if (!submitted && hasReferenceNumberFormat && proposalId) {
    info = (
      <Typography>
        <CopyToClipboard
          text={proposalId}
          successMessage={`'${proposalId}' copied to clipboard`}
        >
          {proposalId}
        </CopyToClipboard>{' '}
        <br /> <small>Pre-submission reference</small>
      </Typography>
    );
  }

  return (
    <QuestionaryContext.Provider value={{ state, dispatch }}>
      <StyledContainer>
        <StyledPaper elevation={elevation}>
          <Questionary
            title={state.proposal.title || 'New Proposal'}
            info={info}
          />
        </StyledPaper>
      </StyledContainer>
    </QuestionaryContext.Provider>
  );
}
