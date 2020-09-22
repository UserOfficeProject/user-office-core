import produce from 'immer';

import { Sample } from 'generated/sdk';
import { Event } from 'models/SampleSubmissionModel';

export const useSampleEditorReducer = (dispatch: React.Dispatch<Event>) => {
  const sampleEditorReducer: React.Reducer<Sample, Event> = (state, action) => {
    return produce(state, draftState => {
      switch (action.type) {
      }
    });
  };

  return { sampleEditorReducer };
};
