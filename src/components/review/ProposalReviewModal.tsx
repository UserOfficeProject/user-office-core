import { TransitionProps } from '@material-ui/core/transitions/transition';

import {
  IconButton,
  Dialog,
  DialogContent,
  AppBar,
  Toolbar,
  Typography,
  makeStyles,
  createStyles,
  Theme,
  Slide,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import React, { Ref } from 'react';

import ProposalReview from './ProposalReviewReviewer';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
  })
);

const SlideComponent = (props: TransitionProps, ref: Ref<unknown>) => (
  <Slide direction="up" ref={ref} {...props} />
);

const Transition = React.forwardRef<unknown, TransitionProps>(SlideComponent);

type ProposalReviewModalProps = {
  reviewModalOpen: boolean;
  setReviewModalOpen: (isOpen: boolean) => void;
  editReviewID: number;
};

const ProposalReviewModal: React.FC<ProposalReviewModalProps> = ({
  reviewModalOpen,
  setReviewModalOpen,
  editReviewID,
}) => {
  const classes = useStyles();

  const handleClose = () => {
    setReviewModalOpen(false);
  };

  return (
    <>
      <Dialog
        open={reviewModalOpen}
        fullScreen
        onClose={(): void => handleClose()}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Review
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <ProposalReview reviewId={editReviewID} />
        </DialogContent>
      </Dialog>
    </>
  );
};

ProposalReviewModal.propTypes = {
  editReviewID: PropTypes.number.isRequired,
  reviewModalOpen: PropTypes.bool.isRequired,
  setReviewModalOpen: PropTypes.func.isRequired,
};

export default ProposalReviewModal;
