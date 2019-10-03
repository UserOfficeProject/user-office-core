import React from "react";
import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import QuestionaryEditorTopic from "./QuestionaryEditorTopic";
import QuestionaryEditorModel, { ActionType } from "./QuestionaryEditorModel";
import {
  Paper,
  makeStyles,
  useTheme,
  Modal,
  Backdrop,
  Fade
} from "@material-ui/core";
import { usePersistModel } from "../hooks/usePersistModel";
import { ProposalTemplateField } from "../model/ProposalModel";
import QuestionaryFieldEditor from "./QuestionaryFieldEditor";

export default function QuestionaryEditor() {
  var { persistModel, isLoading } = usePersistModel();
  var { state, dispatch } = QuestionaryEditorModel([persistModel]);
  const [selectedField, setSelectedField] = React.useState<ProposalTemplateField | null>(null);

  const theme = useTheme();
  const classes = makeStyles(theme => ({
    paper: {
      margin: theme.spacing(3),
      padding: theme.spacing(2),
      [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
        padding: theme.spacing(3)
      }
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalContainer: {
      backgroundColor:"white"
    }
  }))();

  const getTopicListStyle = (isDraggingOver: any) => ({
    background: isDraggingOver
      ? theme.palette.primary.light
      : theme.palette.grey[100],
    transition: "all 500ms cubic-bezier(0.190, 1.000, 0.220, 1.000)",
    display: "flex"
  });

  const onDragEnd = (result: DropResult) => {
    if (result.type === "field") {
      dispatch({
        type: ActionType.MOVE_ITEM,
        payload: { source: result.source, destination: result.destination }
      });
    }
  };

  const onClick = (data: ProposalTemplateField) => {
    setSelectedField(data);
  };

  const handleFieldEditorClose = () => {
    setSelectedField(null);
  };

  return (
    <>
      <Paper className={classes.paper}>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="topics" direction="horizontal" type="topic">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getTopicListStyle(snapshot.isDraggingOver)}
              >
                {state!.topics.map((topic, index) => (
                  <QuestionaryEditorTopic
                    data={topic}
                    dispatch={dispatch}
                    index={index}
                    key={topic.topic_id}
                    onItemClick={onClick}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>

      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={selectedField != null}
        onClose={handleFieldEditorClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={selectedField != null}>
          <QuestionaryFieldEditor field={selectedField} />
        </Fade>
      </Modal>
    </>
  );
}
