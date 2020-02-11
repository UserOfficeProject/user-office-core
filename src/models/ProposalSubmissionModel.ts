import produce from "immer";
import { Reducer } from "react";
import {
  Proposal,
  ProposalStatus,
  QuestionaryField,
  QuestionaryStep
} from "../generated/sdk";
import useReducerWithMiddleWares from "../utils/useReducerWithMiddleWares";
import {
  getFieldById,
  getQuestionaryStepByTopicId
} from "./ProposalModelFunctions";

export enum EventType {
  BACK_CLICKED = "BACK_CLICKED",
  RESET_CLICKED = "RESET_CLICKED",
  SAVE_AND_NEXT_CLICKED = "SAVE_AND_NEXT_CLICKED",
  SAVE_CLICKED = "SAVE_CLICKED",
  SAVE_STEP_CLICKED = "SAVE_STEP_CLICKED",
  FINISH_STEP_CLICKED = "FINISH_STEP_CLICKED",
  SAVE_GENERAL_INFO_CLICKED = "SAVE_GENERAL_INFO_CLICKED",
  FIELD_CHANGED = "FIELD_CHANGED",
  MODEL_LOADED = "MODEL_LOADED",
  SUBMIT_PROPOSAL_CLICKED = "SUBMIT_PROPOSAL_CLICKED",
  API_CALL_ERROR = "API_ERROR_OCCURRED",
  API_CALL_SUCCESS = "API_SUCCESS_OCCURRED",
  PROPOSAL_METADATA_CHANGED = "PROPOSAL_INFORMATION_CHANGED"
}
export interface IEvent {
  type: EventType;
  payload?: any;
}

export interface IProposalSubmissionModelState {
  isDirty: boolean;
  proposal: Proposal;
}

// rename this function
export function ProposalSubmissionModel(
  initialProposal: Proposal,
  middlewares?: Array<Function>
) {
  const [modelState, dispatch] = useReducerWithMiddleWares<
    Reducer<IProposalSubmissionModelState, IEvent>
  >(reducer, { isDirty: false, proposal: initialProposal }, middlewares || []);

  function reducer(state: IProposalSubmissionModelState, action: IEvent) {
    return produce(state, draftState => {
      switch (action.type) {
        case EventType.FIELD_CHANGED:
          const field = getFieldById(
            draftState.proposal.questionary,
            action.payload.id
          ) as QuestionaryField;
          field.value = action.payload.newValue;
          draftState.isDirty = true;
          return draftState;

        case EventType.PROPOSAL_METADATA_CHANGED:
          draftState = {
            ...draftState,
            proposal: { ...draftState.proposal, ...action.payload }
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
            ...action.payload.proposal
          };
          (getQuestionaryStepByTopicId(
            draftState.proposal.questionary!,
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
          break;
      }
    });
  }
  return { state: modelState, dispatch };
}
