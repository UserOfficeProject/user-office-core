import { Grid, Modal, Backdrop, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { FunctionComponent } from 'react';

import { DataType } from '../../generated/sdk';
import { QuestionRel, ProposalTemplate } from '../../generated/sdk';
import { Event } from '../../models/QuestionaryEditorModel';
import JSDict from '../../utils/Dictionary';
import { AdminComponentBoolean } from './AdminComponentBoolean';
import { AdminComponentDate } from './AdminComponentDate';
import { AdminComponentEmbellishment } from './AdminComponentEmbellishment';
import { AdminComponentFileUpload } from './AdminComponentFileUpload';
import { AdminComponentMultipleChoice } from './AdminComponentMultipleChoice';
import { AdminComponentTextInput } from './AdminComponentTextInput';

export default function QuestionaryFieldEditor(props: {
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
  componentMap.put(DataType.BOOLEAN, AdminComponentBoolean);
  componentMap.put(DataType.EMBELLISHMENT, AdminComponentEmbellishment);
  componentMap.put(DataType.DATE, AdminComponentDate);
  componentMap.put(DataType.FILE_UPLOAD, AdminComponentFileUpload);
  componentMap.put(
    DataType.SELECTION_FROM_OPTIONS,
    AdminComponentMultipleChoice
  );
  componentMap.put(DataType.TEXT_INPUT, AdminComponentTextInput);

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
