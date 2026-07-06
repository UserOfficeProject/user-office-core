import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import React, { useState } from 'react';

import { usePersistQuestionaryEditorModel } from 'hooks/questionary/usePersistQuestionaryEditorModel';
import { useTemplateEditorSelection } from 'hooks/questionary/useTemplateEditorSelection';
import QuestionaryEditorModel, {
  EventType,
} from 'models/questionary/QuestionaryEditorModel';
import { handleTemplateDragEnd } from 'models/questionary/templateEditorDragHandlers';
import { StyledContainer, StyledPaper } from 'styles/StyledComponents';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

import PreviewTemplateModal from './PreviewTemplateModal';
import QuestionEditor from './QuestionEditor';
import QuestionTemplateRelationEditor from './QuestionTemplateRelationEditor';
import { TemplateEditorContent } from './TemplateEditorContent';
import { TemplateEditorToolbar } from './TemplateEditorToolbar';
import { TemplateMetadataEditor } from './TemplateMetadataEditor';

export default function TemplateEditor() {
  const { api } = useDataApiWithFeedback();

  const {
    selectedQuestionTemplateRelation,
    setSelectedQuestionTemplateRelation,
    selectedQuestion,
    setSelectedQuestion,
    hoveredDependency,
    openedPreviewTemplateId,
    setOpenedPreviewTemplateId,
    questionPickerTopicId,
    setQuestionPickerTopicId,
    handleEvents,
  } = useTemplateEditorSelection();

  const { persistModel, isLoading } = usePersistQuestionaryEditorModel();
  const { state, dispatch } = QuestionaryEditorModel([
    persistModel,
    handleEvents,
  ]);

  const [isTopicReorderMode, setIsTopicReorderMode] = useState(false);

  const getContainerStyle = (): React.CSSProperties =>
    isLoading || state.templateId === 0
      ? {
          pointerEvents: 'none',
          userSelect: 'none',
          opacity: 0.5,
        }
      : {};

  return (
    <StyledContainer maxWidth={false}>
      {openedPreviewTemplateId !== null && (
        <PreviewTemplateModal
          templateId={openedPreviewTemplateId}
          templateGroupId={state.groupId}
          setTemplateId={setOpenedPreviewTemplateId}
        />
      )}
      <TemplateMetadataEditor dispatch={dispatch} template={state} />
      <StyledPaper style={getContainerStyle()}>
        {isLoading && <LinearProgress />}
        <TemplateEditorToolbar
          stepCount={state.steps.length}
          isTopicReorderMode={isTopicReorderMode}
          onToggleReorderMode={() => setIsTopicReorderMode((prev) => !prev)}
          onPreview={() => setOpenedPreviewTemplateId(state.templateId)}
        />
        <TemplateEditorContent
          template={state}
          dispatch={dispatch}
          questionPickerTopicId={questionPickerTopicId}
          closeQuestionPicker={() => setQuestionPickerTopicId(null)}
          isTopicReorderMode={isTopicReorderMode}
          hoveredDependency={hoveredDependency}
          onDragEnd={(result) =>
            handleTemplateDragEnd(result, { state, dispatch, api })
          }
        />
        {state.steps.length === 0 && (
          <Button
            variant="outlined"
            sx={{ display: 'flex', margin: '10px auto' }}
            onClick={(): void =>
              dispatch({
                type: EventType.CREATE_TOPIC_REQUESTED,
                payload: { isFirstTopic: true },
              })
            }
          >
            <PlaylistAddIcon />
            &nbsp; Add topic
          </Button>
        )}
      </StyledPaper>

      <QuestionTemplateRelationEditor
        field={selectedQuestionTemplateRelation}
        dispatch={dispatch}
        closeMe={() => setSelectedQuestionTemplateRelation(null)}
        template={state}
      />

      <QuestionEditor
        field={selectedQuestion}
        dispatch={dispatch}
        closeMe={() => setSelectedQuestion(null)}
        template={state}
      />
    </StyledContainer>
  );
}
