import { makeStyles, Modal, Backdrop, Fade, Grid } from '@material-ui/core';
import React, { FunctionComponent } from 'react';
export default function ModalWrapper(props: {
  isOpen: boolean;
  closeMe: (event: any) => void;
  children: React.ReactNode;
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

  return (
    <Modal
      className={classes.modal}
      open={props.isOpen}
      onClose={props.closeMe}
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
