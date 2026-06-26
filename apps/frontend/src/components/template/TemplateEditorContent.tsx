import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';

import { Template } from 'generated/sdk';
import { Event } from 'models/questionary/QuestionaryEditorModel';

import { QuestionPicker } from './QuestionPicker';
import QuestionaryEditorTopic from './TemplateTopicEditor';

interface TemplateEditorContentProps {
  template: Template;
  dispatch: React.Dispatch<Event>;
  questionPickerTopicId: number | null;
  closeQuestionPicker: () => void;
  isTopicReorderMode: boolean;
  hoveredDependency: string;
  onDragEnd: (result: DropResult) => void;
}

export function TemplateEditorContent({
  template,
  dispatch,
  questionPickerTopicId,
  closeQuestionPicker,
  isTopicReorderMode,
  hoveredDependency,
  onDragEnd,
}: TemplateEditorContentProps) {
  const theme = useTheme();
  const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up('xl'));

  const getTopicListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: 'all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)',
    display: 'flex',
    overflow: 'auto',
    maxHeight: isExtraLargeScreen ? '1400px' : '700px',
  });

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="topics" direction="horizontal" type="topic">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getTopicListStyle(snapshot.isDraggingOver)}
            className="tinyScroll"
          >
            {template.steps.map((step, index) => {
              const questionPicker =
                step.topic.id === questionPickerTopicId ? (
                  <QuestionPicker
                    topic={step.topic}
                    dispatch={dispatch}
                    template={template}
                    closeMe={closeQuestionPicker}
                    id="questionPicker"
                  />
                ) : null;

              return (
                <React.Fragment key={step.topic.id}>
                  <QuestionaryEditorTopic
                    data={step}
                    dispatch={dispatch}
                    index={index}
                    dragMode={isTopicReorderMode}
                    hoveredDependency={hoveredDependency}
                  />
                  {questionPicker}
                </React.Fragment>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
