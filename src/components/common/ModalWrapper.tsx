import { Backdrop, Fade, Grid, makeStyles, Modal } from '@material-ui/core';
import React from 'react';

export default function ModalWrapper(props: {
  isOpen: boolean;
  close: () => void;
  children: React.ReactNode;
}) {
  const classes = makeStyles(theme => ({
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
      className={classes.modal}
      open={props.isOpen}
      onClose={props.close}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={props.isOpen}>
        <Grid container className={classes.container}>
          {props.children}
        </Grid>
      </Fade>
    </Modal>
  );
}
