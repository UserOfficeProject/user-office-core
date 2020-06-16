import produce from 'immer';
import { Dispatch, Reducer } from 'react';
import { ProposalSubsetSumbission } from '../models/ProposalModel';
import { Answer, ProposalStatus, QuestionaryStep } from '../generated/sdk';
import useReducerWithMiddleWares from '../utils/useReducerWithMiddleWares';
import { ProposalSubsetSumbission } from './ProposalModel';
import {
  getFieldById,
  getQuestionaryStepByTopicId,
} from './ProposalModelFunctions';

export enum EventType {
  BACK_CLICKED = 'BACK_CLICKED',
  RESET_CLICKED = 'RESET_CLICKED',
  SAVE_AND_NEXT_CLICKED = 'SAVE_AND_NEXT_CLICKED',
  SAVE_CLICKED = 'SAVE_CLICKED',
  SAVE_STEP_CLICKED = 'SAVE_STEP_CLICKED',
  FINISH_STEP_CLICKED = 'FINISH_STEP_CLICKED',
  SAVE_GENERAL_INFO_CLICKED = 'SAVE_GENERAL_INFO_CLICKED',
  FIELD_CHANGED = 'FIELD_CHANGED',
  MODEL_LOADED = 'MODEL_LOADED',
  SUBMIT_PROPOSAL_CLICKED = 'SUBMIT_PROPOSAL_CLICKED',
  API_CALL_ERROR = 'API_ERROR_OCCURRED',
  API_CALL_SUCCESS = 'API_SUCCESS_OCCURRED',
  PROPOSAL_METADATA_CHANGED = 'PROPOSAL_INFORMATION_CHANGED',
}
export interface Event {
  type: EventType;
  payload?: any;
}

export interface ProposalSubmissionModelState {
  isDirty: boolean;
  proposal: ProposalSubsetSumbission;
}

// rename this function
export function ProposalSubmissionModel(
  initialProposal: ProposalSubsetSumbission,
  middlewares?: Array<Function>
): {
  state: ProposalSubmissionModelState;
  dispatch: Dispatch<Event>;
} {
  function reducer(state: ProposalSubmissionModelState, action: Event) {
    return produce(state, draftState => {
      switch (action.type) {
        case EventType.FIELD_CHANGED:
          const field = getFieldById(
            draftState.proposal.questionary.steps,
            action.payload.id
          ) as Answer;
          field.value = action.payload.newValue;
          draftState.isDirty = true;

          return draftState;

        case EventType.PROPOSAL_METADATA_CHANGED:
          draftState = {
            ...draftState,
            proposal: { ...draftState.proposal, ...action.payload },
          };
          draftState.isDirty = true;

          return draftState;

        case EventType.SAVE_GENERAL_INFO_CLICKED:
          draftState.isDirty = false;
          break;

        case EventType.SAVE_STEP_CLICKED:
          draftState.isDirty = false;
          break;

        case EventType.FINISH_STEP_CLICKED:
          draftState.proposal = {
            ...draftState.proposal,
            ...action.payload.proposal,
          };
          (getQuestionaryStepByTopicId(
            draftState.proposal.questionary.steps,
            action.payload.topicId
          ) as QuestionaryStep).isCompleted = true;
          draftState.isDirty = false;
          break;

        case EventType.MODEL_LOADED:
          draftState.proposal = action.payload;
          draftState.isDirty = false;
          break;

        case EventType.SUBMIT_PROPOSAL_CLICKED:
          draftState.proposal.status = ProposalStatus.SUBMITTED;
          draftState.isDirty = false;
          break;
      }
    });
  }

  const [modelState, dispatch] = useReducerWithMiddleWares<
    Reducer<ProposalSubmissionModelState, Event>
  >(reducer, { isDirty: false, proposal: initialProposal }, middlewares || []);

  return { state: modelState, dispatch };
}
