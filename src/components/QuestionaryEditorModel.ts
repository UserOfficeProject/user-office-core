import { useProposalQuestionTemplate } from "../hooks/useProposalQuestionTemplate";
import { useReducer, Reducer, useEffect } from "react";
import {
  ProposalTemplate} from "../model/ProposalModel";
import produce from "immer";

export enum ActionType {
  READY,
  MOVE_ITEM,
  MOVE_TOPIC,
  UPDATE_TOPIC,
  UPDATE_ITEM
}

interface IAction {
  type: ActionType;
  payload: any;
}

type IState = ProposalTemplate | null;

export default function QuestionaryEditorModel() {
  const { proposalTemplate } = useProposalQuestionTemplate();
  useEffect(() => {
    if (proposalTemplate) {
      dispatch({ type: ActionType.READY, payload: proposalTemplate });
    }
  }, [proposalTemplate]);
  
  let [state, dispatch] = useReducer<Reducer<IState, IAction>>(reducer, null);
  
  function reducer(state: IState, action: IAction): IState {
    return produce(state, draft => {
      switch (action.type) {
        case ActionType.READY:
          return action.payload;
        case ActionType.MOVE_ITEM:
          if (!draft) {
            return draft;
          }
          if(!action.payload.destination) {
            return draft;
          }
          
          var from: any = draft.topics.find(topic => {
            return (
              topic.topic_id.toString() === action.payload.source.droppableId
            );
          });

          var to: any = draft.topics.find(topic => {
            return (
              topic.topic_id.toString() ===
              action.payload.destination.droppableId
            );
          });

          to.fields.splice(
            action.payload.destination.index,
            0,
            ...from.fields.splice(action.payload.source.index, 1)
          );

          return draft;
      }
    });
  }

  return { state, dispatch };
}



