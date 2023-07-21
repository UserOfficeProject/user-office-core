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
  GENERIC_TEMPLATE_EVENT,
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
  previewMode?: boolean;
}
export default function ProposalContainer(props: ProposalContainerProps) {
  const { proposal, proposalUpdated, elevation, previewMode } = props;

  const [initialState] = useState(
    new ProposalSubmissionState(proposal, previewMode)
  );

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

  const customReducers = (
    state: ProposalSubmissionState,
    draftState: ProposalSubmissionState,
    action: Event
  ) => {
    switch (action.type) {
      case 'SAMPLE_DECLARATION_ITEMS_MODIFIED':
        draftState.proposal.samples = action.newItems;
        draftState.isDirty = true;
        break;
      case GENERIC_TEMPLATE_EVENT.ITEMS_MODIFIED:
        if (action.newItems) {
          if (state.proposal.genericTemplates) {
            const questionIds = action.newItems.map((value) => value.id);
            draftState.proposal.genericTemplates = [
              ...state.proposal.genericTemplates.filter(
                (value) =>
                  !questionIds.some(
                    (id) =>
                      id === value.id || state.deletedTemplates.includes(id)
                  )
              ),
              ...action.newItems,
            ];
            //if new templates have been created add them to the list of created templates
            if (
              action.newItems.length > state.proposal.genericTemplates.length
            ) {
              draftState.createdTemplates = [
                ...state.createdTemplates,
                ...questionIds.slice(
                  -(
                    action.newItems.length -
                    state.proposal.genericTemplates.length
                  )
                ),
              ];
            }
          } else {
            draftState.proposal.genericTemplates = action.newItems;
          }
        }
        if (
          action.newItems?.length !== state.proposal.genericTemplates?.length
        ) {
          draftState.isDirty = true;
        }
        break;

      case GENERIC_TEMPLATE_EVENT.ITEMS_DELETED:
        if (action.newItems) {
          if (state.proposal.genericTemplates) {
            const questionIds = action.newItems.map((value) => value.id);
            draftState.proposal.genericTemplates = [
              ...state.proposal.genericTemplates.filter(
                (value) => !questionIds.some((id) => id === value.id)
              ),
            ];
            draftState.deletedTemplates = [
              ...state.deletedTemplates,
              ...questionIds,
            ];
            action.newItems = [];
          }
        }
        draftState.isDirty = true;
        break;
    }

    return draftState;
  };

  const { state, dispatch } = QuestionarySubmissionModel(
    initialState,
    [eventHandlers, customEventHandlers],
    customReducers
  );

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
            previewMode={previewMode}
          />
        </StyledPaper>
      </StyledContainer>
    </QuestionaryContext.Provider>
  );
}
