import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Modal from '@material-ui/core/Modal';
import makeStyles from '@material-ui/core/styles/makeStyles';
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
