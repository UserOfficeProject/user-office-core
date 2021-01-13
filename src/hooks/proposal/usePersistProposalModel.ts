import { ProposalSubmissionState } from 'models/ProposalSubmissionState';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';
import { MiddlewareInputParams } from 'utils/useReducerWithMiddleWares';

import {
  Event,
  EventType,
  QuestionarySubmissionState,
} from '../../models/QuestionarySubmissionState';

export function usePersistProposalModel() {
  const { api, isExecutingCall } = useDataApiWithFeedback();

  const persistModel = ({
    getState,
    dispatch,
  }: MiddlewareInputParams<QuestionarySubmissionState, Event>) => {
    return (next: Function) => async (action: Event) => {
      next(action);
      switch (action.type) {
        case EventType.PROPOSAL_SUBMIT_CLICKED: {
          api('Saved')
            .submitProposal({
              id: action.payload.proposalId,
            })
            .then(result => {
              const state = getState() as ProposalSubmissionState;
              dispatch({
                type: EventType.PROPOSAL_LOADED,
                payload: {
                  proposal: {
                    ...state.proposal,
                    ...result.submitProposal.proposal,
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
