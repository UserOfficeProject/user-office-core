import PropTypes from 'prop-types';
import React from 'react';

import { SepAssignment, ReviewWithNextProposalStatus } from 'generated/sdk';

interface ReviewAndAssignmentData {
  currentAssignment: SepAssignment | null;
  setCurrentAssignment: React.Dispatch<SepAssignment | null>;
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
    payload: SepAssignment | ReviewWithNextProposalStatus | null | undefined;
  }
): ReviewAndAssignmentData => {
  switch (action.type) {
    case ActionType.SET_ASSIGNMENT:
      return {
        ...previousState,
        currentAssignment: action.payload as SepAssignment,
      };

    case ActionType.SET_REVIEW:
      return {
        ...previousState,
        currentAssignment: {
          ...previousState.currentAssignment,
          review: action.payload as ReviewWithNextProposalStatus,
        } as SepAssignment,
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
        setCurrentAssignment: (payload: SepAssignment | null) => {
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
