import produce from 'immer';
import { Dispatch, Reducer } from 'react';

import { Answer, QuestionaryStep } from 'generated/sdk';
import { ProposalSubsetSumbission } from 'models/ProposalModel';
import {
  getFieldById,
  getQuestionaryStepByTopicId,
} from 'models/QuestionaryFunctions';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';

export enum EventType {
  BACK_CLICKED = 'BACK_CLICKED',
  RESET_CLICKED = 'RESET_CLICKED',
  SAVE_STEP_CLICKED = 'SAVE_STEP_CLICKED',
  FINISH_STEP_CLICKED = 'FINISH_STEP_CLICKED',
  SAVE_GENERAL_INFO_CLICKED = 'SAVE_GENERAL_INFO_CLICKED',
  FIELD_CHANGED = 'FIELD_CHANGED',
  MODEL_LOADED = 'MODEL_LOADED',
  SUBMIT_PROPOSAL_CLICKED = 'SUBMIT_PROPOSAL_CLICKED',
  PROPOSAL_METADATA_CHANGED = 'PROPOSAL_INFORMATION_CHANGED',
  STEP_ANSWERED = 'TOPIC_ANSWERED',
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
  middlewares?: Array<ReducerMiddleware<ProposalSubmissionModelState, Event>>
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

        case EventType.FINISH_STEP_CLICKED:
          draftState.proposal = {
            ...draftState.proposal,
            ...action.payload.proposal,
          };
          (getQuestionaryStepByTopicId(
            draftState.proposal.questionary.steps,
            action.payload.topicId
          ) as QuestionaryStep).isCompleted = true;
          break;

        case EventType.STEP_ANSWERED:
          const updatedStep = action.payload.step as QuestionaryStep;
          const stepIndex = draftState.proposal.questionary.steps.findIndex(
            step => step.topic.id === updatedStep.topic.id
          );
          draftState.proposal.questionary.steps.splice(
            stepIndex,
            1,
            updatedStep
          );
          draftState.isDirty = false;

          break;

        case EventType.MODEL_LOADED:
          draftState.proposal = action.payload;
          draftState.isDirty = false;
          break;

        case EventType.SUBMIT_PROPOSAL_CLICKED:
          draftState.proposal.submitted = true;
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
