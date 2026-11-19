import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import { TransitionProps } from '@mui/material/transitions/transition';
import Typography from '@mui/material/Typography';
import React from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ExperimentReviewModalProps = {
  modalOpen: boolean;
  handleClose: () => void;
  title: string;
  reviewItemId?: number | null;
  children: React.ReactElement;
};

//TODO: This is a copy of the ProposalReviewModal. We should refactor this to use a common modal component.
const ExperimentReviewModal = ({
  title,
  modalOpen,
  handleClose,
  children,
}: ExperimentReviewModalProps) => {
  return (
    <>
      <Dialog
        open={modalOpen}
        fullScreen
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              data-cy="close-modal"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="h1"
              sx={(theme) => ({
                marginLeft: theme.spacing(2),
                flex: 1,
                color: theme.palette.primary.contrastText,
              })}
            >
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          {children &&
            React.cloneElement(children, {
              isInsideModal: true,
            })}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExperimentReviewModal;
