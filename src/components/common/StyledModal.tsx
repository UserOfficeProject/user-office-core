import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Modal, { ModalProps } from '@material-ui/core/Modal';
import makeStyles from '@material-ui/core/styles/makeStyles';
import React from 'react';

export default function StyledModal(
  props: Omit<ModalProps, 'Backdrop' | 'BackdropProps' | 'className'>
) {
  const { children, ...restOfTheProps } = props;
  const classes = makeStyles((theme) => ({
    container: {
      backgroundColor: 'white',
      padding: theme.spacing(3),
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

  return (
    <Modal
      {...restOfTheProps}
      className={classes.modal}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={props.open}>
        <Grid container className={classes.container}>
          {children}
        </Grid>
      </Fade>
    </Modal>
  );
}
