import { Grid, Modal, Backdrop, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';

import { DataType } from '../../../generated/sdk';
import { QuestionRel, ProposalTemplate } from '../../../generated/sdk';
import { Event } from '../../../models/QuestionaryEditorModel';
import JSDict from '../../../utils/Dictionary';
import { QuestionRelBooleanForm } from './questionRel/QuestionRelBooleanForm';
import { QuestionRelDateForm } from './questionRel/QuestionRelDateForm';
import { QuestionRelEmbellismentForm } from './questionRel/QuestionRelEmbellismentForm';
import { QuestionRelFileUploadForm } from './questionRel/QuestionRelFileUploadForm';
import { QuestionRelMultipleChoiceForm } from './questionRel/QuestionRelMultipleChoiceForm';
import { QuestionRelTextInputForm } from './questionRel/QuestionRelTextInputForm';

export default function QuestionRelEditor(props: {
  field: QuestionRel | null;
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

  const componentMap = JSDict.Create<DataType, AdminComponentSignature>();
  componentMap.put(DataType.BOOLEAN, QuestionRelBooleanForm);
  componentMap.put(DataType.EMBELLISHMENT, QuestionRelEmbellismentForm);
  componentMap.put(DataType.DATE, QuestionRelDateForm);
  componentMap.put(DataType.FILE_UPLOAD, QuestionRelFileUploadForm);
  componentMap.put(
    DataType.SELECTION_FROM_OPTIONS,
    QuestionRelMultipleChoiceForm
  );
  componentMap.put(DataType.TEXT_INPUT, QuestionRelTextInputForm);

  if (props.field === null) {
    return null;
  }
  if (componentMap.get(props.field.question.dataType) === null) {
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
          {React.createElement(
            componentMap.get(props.field.question.dataType)!,
            {
              field: props.field,
              dispatch: props.dispatch,
              closeMe: props.closeMe,
              template: props.template,
            }
          )}
        </Grid>
      </Fade>
    </Modal>
  );
}

interface AdminComponentProps {
  field: QuestionRel;
  template: ProposalTemplate;
  dispatch: React.Dispatch<Event>;
  closeMe: Function;
}

export type AdminComponentSignature = FunctionComponent<AdminComponentProps>;
