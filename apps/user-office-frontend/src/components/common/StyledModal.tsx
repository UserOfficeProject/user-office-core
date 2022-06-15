import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Modal, { ModalProps } from '@mui/material/Modal';
import React from 'react';

const boxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  backgroundColor: 'background.paper',
  border: 'none',
  boxShadow: '4',
  padding: 3,
  maxHeight: '100%',
  overflowY: 'auto',
};

export default function StyledModal(
  props: Omit<ModalProps, 'Backdrop' | 'BackdropProps' | 'className'>
) {
  const { children, ...restOfTheProps } = props;

  return (
    <Modal
      {...restOfTheProps}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={props.open}>
        <Box sx={boxStyle}>{children}</Box>
      </Fade>
    </Modal>
  );
}
