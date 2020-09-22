import { Answer, QuestionaryStep, Sample } from 'generated/sdk';
import produce from 'immer';
import { Dispatch, Reducer } from 'react';
import { clamp } from 'utils/Math';
import {
  ReducerMiddleware,
  useReducerWithMiddleWares,
} from 'utils/useReducerWithMiddleWares';
import { getFieldById } from './QuestionaryFunctions';

export enum EventType {
  FIELD_CHANGED = 'FIELD_CHANGED',
  SAMPLE_LOADED = 'MODEL_LOADED',
  QUESTIONARY_COMPLETE = 'QUESTIONARY_COMPLETE',
  BACK_CLICKED = 'BACK_CLICKED',
  RESET_CLICKED = 'RESET_CLICKED',
  TITLE_STEP_COMPLETED = 'TITLE_STEP_COMPLETED',
  GO_STEP_BACK = 'GO_TO_STEP_REQUESTED',
  GO_STEP_FORWARD = 'GO_STEP_FORWARD',
  GO_TO_STEP = 'GO_TO_STEP',
  QUESTIONARY_LOADED = 'QUESTIONARY_LOADED',
  QUESTIONARY_STEP_ANSWERED = 'QUESTIONARY_STEP_ANSWERED',
}
export interface Event {
  type: EventType;
  payload?: any;
}

interface StepMetaData {
  title: string;
  isComplete: boolean;
  isEditable: boolean;
}
export interface SampleSubmissionModelState {
  stepIndex: number;
  steps: StepMetaData[];
  isDirty: boolean;
  sample: Sample;
  isShowingReset: boolean;
}

function createStepMetadata(sample: Sample): StepMetaData[] {
  const questionary = sample.questionary;
  let steps = [
    {
      title: 'Give title',
      isComplete: sample.title !== '',
      isEditable: true,
    },
  ];
  steps = steps.concat(
    questionary.steps.map(step => {
      return {
        isComplete: step.isCompleted,
        isEditable: true,
        title: step.topic.title,
      };
    })
  );
  return steps;
}
/** returns the index the form should start on, for new declaration it's 0,
 * but for unfinished declaration it's the first unfinished step */
function getInitialStepIndex(stepMedatada: StepMetaData[]): number {
  const lastFinishedStep = stepMedatada
    .slice()
    .reverse()
    .find(step => step.isComplete === true);

  if (!lastFinishedStep) {
    return 0;
  }

  const lastFinishedStepIndex = stepMedatada.indexOf(lastFinishedStep);
  const nextUnfinishedStep = lastFinishedStepIndex + 1;
  const maxStepIndex = stepMedatada.length - 1;

  return clamp(nextUnfinishedStep, 0, maxStepIndex);
}
export function SampleSubmissionModel(
  initialSample: Sample,
  middlewares?: Array<ReducerMiddleware<SampleSubmissionModelState, Event>>
): {
  state: SampleSubmissionModelState;
  dispatch: Dispatch<Event>;
} {
  function reducer(state: SampleSubmissionModelState, action: Event) {
    return produce(state, draftState => {
      switch (action.type) {
        case EventType.FIELD_CHANGED:
          const field = getFieldById(
            draftState.sample.questionary.steps,
            action.payload.id
          ) as Answer;
          field.value = action.payload.newValue;
          draftState.isDirty = true;
          break;

        case EventType.SAMPLE_LOADED:
          draftState.sample = action.payload.sample;
          draftState.isDirty = false;
          break;

        case EventType.QUESTIONARY_COMPLETE:
          draftState.isDirty = false;
          break;

        case EventType.TITLE_STEP_COMPLETED:
          draftState.steps[draftState.stepIndex].isComplete = true;
          draftState.sample.title = action.payload.title;
          draftState.stepIndex += 1;
          draftState.isDirty = false;
          break;

        case EventType.GO_STEP_BACK:
          draftState.stepIndex = clamp(
            draftState.stepIndex - 1,
            0,
            state.steps.length - 1
          );
          break;

        case EventType.GO_STEP_FORWARD:
          let nextStepIndex = draftState.stepIndex + 1;
          let lastStepIndex = state.steps.length - 1;
          if (nextStepIndex <= lastStepIndex) {
            draftState.stepIndex = clamp(nextStepIndex, 0, lastStepIndex);
          } else {
            dispatch({ type: EventType.QUESTIONARY_COMPLETE });
          }
          break;

        case EventType.GO_TO_STEP:
          draftState.stepIndex = clamp(
            action.payload.stepIndex,
            0,
            state.steps.length - 1
          );
          break;

        case EventType.QUESTIONARY_LOADED:
          draftState.sample.questionary = action.payload.questionary;
          draftState.steps = createStepMetadata(draftState.sample);
          draftState.isDirty = false;
          break;

        case EventType.QUESTIONARY_STEP_ANSWERED:
          const updatedStep = action.payload.questionaryStep as QuestionaryStep;
          const partially = action.payload.partially as boolean;
          const stepIndex = draftState.sample.questionary.steps.findIndex(
            step => step.topic.id === updatedStep.topic.id
          );
          draftState.sample.questionary.steps[stepIndex] = updatedStep;

          draftState.isDirty = false;
          if (!partially) {
            draftState.steps[draftState.stepIndex].isComplete = true;
          }
          break;
      }
    });
  }

  const stepMetadata = createStepMetadata(initialSample);
  const [modelState, dispatch] = useReducerWithMiddleWares<
    Reducer<SampleSubmissionModelState, Event>
  >(
    reducer,
    {
      isDirty: false,
      sample: initialSample,
      stepIndex: getInitialStepIndex(stepMetadata),
      isShowingReset: false,
      steps: stepMetadata,
    },
    middlewares || []
  );

  return { state: modelState, dispatch };
}
