import { Grid, Modal, Backdrop, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';

import { DataType } from '../../generated/sdk';
import { QuestionRel, ProposalTemplate } from '../../generated/sdk';
import { Event } from '../../models/QuestionaryEditorModel';
import JSDict from '../../utils/Dictionary';
import { QuestionRelBooleanForm } from './forms/QuestionRelBooleanForm';
import { QuestionRelDateForm } from './forms/QuestionRelDateForm';
import { QuestionRelEmbellismentForm } from './forms/QuestionRelEmbellismentForm';
import { QuestionRelFileUploadForm } from './forms/QuestionRelFileUploadForm';
import { QuestionRelMultipleChoiceForm } from './forms/QuestionRelMultipleChoiceForm';
import { QuestionRelTextInputForm } from './forms/QuestionRelTextInputForm';

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

interface AdminComponentShellProps extends AdminComponentProps {
  label: string;
}
export type AdminComponentSignature = FunctionComponent<AdminComponentProps>;

export type AdminComponentShellSignature = FunctionComponent<
  AdminComponentShellProps
>;
