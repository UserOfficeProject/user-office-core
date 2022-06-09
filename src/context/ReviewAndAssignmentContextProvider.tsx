import PropTypes from 'prop-types';
import React from 'react';

import { ReviewWithNextProposalStatus } from 'generated/sdk';
import { SEPProposalAssignmentType } from 'hooks/SEP/useSEPProposalsData';

interface ReviewAndAssignmentData {
  currentAssignment: SEPProposalAssignmentType | null;
  setCurrentAssignment: React.Dispatch<SEPProposalAssignmentType | null>;
  setAssignmentReview: React.Dispatch<
    ReviewWithNextProposalStatus | null | undefined
  >;
}

const initialState: ReviewAndAssignmentData = {
  currentAssignment: null,
  setCurrentAssignment: (data) => data,
  setAssignmentReview: (data) => data,
};

enum ActionType {
  SET_ASSIGNMENT = 'SET_ASSIGNMENT',
  SET_REVIEW = 'SET_REVIEW',
}

const reducer = (
  previousState = initialState,
  action: {
    type: ActionType;
    payload:
      | SEPProposalAssignmentType
      | ReviewWithNextProposalStatus
      | null
      | undefined;
  }
): ReviewAndAssignmentData => {
  switch (action.type) {
    case ActionType.SET_ASSIGNMENT:
      return {
        ...previousState,
        currentAssignment: action.payload as SEPProposalAssignmentType,
      };

    case ActionType.SET_REVIEW:
      return {
        ...previousState,
        currentAssignment: {
          ...previousState.currentAssignment,
          review: action.payload as ReviewWithNextProposalStatus,
        } as SEPProposalAssignmentType,
      };

    default:
      return previousState;
  }
};

export const ReviewAndAssignmentContext =
  React.createContext<ReviewAndAssignmentData>(initialState);

export const ReviewAndAssignmentContextProvider: React.FC = (
  props
): JSX.Element => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  return (
    <ReviewAndAssignmentContext.Provider
      value={{
        ...state,
        setCurrentAssignment: (payload: SEPProposalAssignmentType | null) => {
          dispatch({
            type: ActionType.SET_ASSIGNMENT,
            payload,
          });
        },
        setAssignmentReview: (
          payload: ReviewWithNextProposalStatus | null | undefined
        ) => {
          dispatch({ type: ActionType.SET_REVIEW, payload });
        },
      }}
    >
      {props.children}
    </ReviewAndAssignmentContext.Provider>
  );
};

ReviewAndAssignmentContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
