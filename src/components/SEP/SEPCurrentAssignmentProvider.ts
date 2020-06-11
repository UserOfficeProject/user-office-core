import { SepAssignment, Review } from '../../generated/sdk';

interface SEPAssignmentData {
  currentAssignment: SepAssignment | null;
}

const initialState: SEPAssignmentData = {
  currentAssignment: null,
};

enum ActionType {
  SET_ASSIGNMENT = 'SET_ASSIGNMENT',
  SET_REVIEW = 'SET_REVIEW',
}

const reducer = (
  previousState = initialState,
  action: { type: ActionType; payload: any }
) => {
  switch (action.type) {
    case ActionType.SET_ASSIGNMENT:
      return { ...previousState, currentAssignment: action.payload };

    case ActionType.SET_REVIEW:
      return {
        ...previousState,
        currentAssignment: {
          ...previousState.currentAssignment,
          review: action.payload,
        },
      };

    default:
      return previousState;
  }
};

let currentState = initialState;

const AssignmentProvider = {
  setCurrentAssignment: (payload: SepAssignment | null) => {
    currentState = reducer(
      { ...currentState },
      { type: ActionType.SET_ASSIGNMENT, payload }
    );
  },
  getCurrentAssignment: () => {
    return currentState;
  },
  setReview: (payload: Review | null) => {
    currentState = reducer(
      { ...currentState },
      { type: ActionType.SET_REVIEW, payload }
    );
  },
};

export default AssignmentProvider;
