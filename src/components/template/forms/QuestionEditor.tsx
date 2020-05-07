import { Backdrop, Fade, Grid, Modal } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';
import { DataType, ProposalTemplate, Question } from '../../../generated/sdk';
import { Event } from '../../../models/QuestionaryEditorModel';
import JSDict from '../../../utils/Dictionary';
import { QuestionBooleanForm } from './question/QuestionBooleanForm';
import { QuestionDateForm } from './question/QuestionDateForm';
import { QuestionEmbellismentForm } from './question/QuestionEmbellismentForm';
import { QuestionFileUploadForm } from './question/QuestionFileUploadForm';
import { QuestionMultipleChoiceForm } from './question/QuestionMultipleChoiceForm';
import { QuestionTextInputForm } from './question/QuestionTextInputForm';
import { QuestionRelAdminComponentSignature } from './QuestionRelEditor';

export default function QuestionEditor(props: {
  field: Question | null;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
  template: ProposalTemplate;
}) {
  const classes = makeStyles(() => ({
    container: {
      backgroundColor: 'white',
      padding: '20px',
      maxWidth: '700px',
      maxHeight: '100%',
      overflowY: 'auto',
    },
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }))();

  const componentMap = JSDict.Create<
    DataType,
    QuestionAdminComponentSignature
  >();
  componentMap.put(DataType.BOOLEAN, QuestionBooleanForm);
  componentMap.put(DataType.EMBELLISHMENT, QuestionEmbellismentForm);
  componentMap.put(DataType.FILE_UPLOAD, QuestionFileUploadForm);
  componentMap.put(DataType.DATE, QuestionDateForm);
  componentMap.put(DataType.SELECTION_FROM_OPTIONS, QuestionMultipleChoiceForm);
  componentMap.put(DataType.TEXT_INPUT, QuestionTextInputForm);

  if (props.field === null) {
    return null;
  }
  if (componentMap.get(props.field.dataType) === null) {
    return <span>Error ocurred</span>;
  }

  return (
    <Modal
      className={classes.modal}
      open={props.field != null}
      onClose={() => {
        props.closeMe();
      }}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={props.field != null}>
        <Grid container className={classes.container}>
          {React.createElement(componentMap.get(props.field.dataType)!, {
            field: props.field,
            dispatch: props.dispatch,
            closeMe: props.closeMe,
            template: props.template,
          })}
        </Grid>
      </Fade>
    </Modal>
  );
}

interface QuestionAdminComponentProps {
  field: Question;
  template: ProposalTemplate;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
}

export type QuestionAdminComponentSignature = FunctionComponent<
  QuestionAdminComponentProps
>;
