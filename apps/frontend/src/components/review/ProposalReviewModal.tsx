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

import { Proposal } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type ProposalReviewModalProps = {
  proposalReviewModalOpen: boolean;
  setProposalReviewModalOpen: (updatedProposal?: Proposal) => void;
  title: string;
  reviewItemId?: number | null;
  children: React.ReactElement;
};

const ProposalReviewModal = ({
  title,
  proposalReviewModalOpen,
  setProposalReviewModalOpen,
  reviewItemId,
  children,
}: ProposalReviewModalProps) => {
  const { api } = useDataApiWithFeedback();

  const loadProposal = async () => {
    if (!reviewItemId) {
      return;
    }

    return api()
      .getProposal({ primaryKey: reviewItemId })
      .then((data) => {
        return data.proposal as Proposal;
      });
  };

  const handleClose = async () => {
    /**
     * TODO: This needs to be refactored a bit and instead of loading proposal before close we could use the proposal used in the modal content tabs.
     * For now this is the easiest solution to get all changes that are done on the proposal inside the modal.
     */
    try {
      const freshProposal = await loadProposal();
      setProposalReviewModalOpen(freshProposal);
    } catch {
      setProposalReviewModalOpen();
    }
  };

  return (
    <>
      <Dialog
        open={proposalReviewModalOpen}
        fullScreen
        onClose={(): Promise<void> => handleClose()}
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

export default ProposalReviewModal;
