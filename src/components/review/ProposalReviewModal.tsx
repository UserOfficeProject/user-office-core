import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import React, { Ref } from 'react';

import { Proposal } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

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
  proposalReviewModalOpen: boolean;
  setProposalReviewModalOpen: (updatedProposal?: Proposal) => void;
  title: string;
  reviewItemId?: number | null;
  children: React.ReactElement;
};

const ProposalReviewModal: React.FC<ProposalReviewModalProps> = ({
  title,
  proposalReviewModalOpen,
  setProposalReviewModalOpen,
  reviewItemId,
  children,
}) => {
  const classes = useStyles();
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
    const freshProposal = await loadProposal();
    setProposalReviewModalOpen(freshProposal);
  };

  return (
    <>
      <Dialog
        open={proposalReviewModalOpen}
        fullScreen
        onClose={(): Promise<void> => handleClose()}
        TransitionComponent={Transition}
      >
        <AppBar className={classes.appBar}>
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
            <Typography variant="h6" component="h1" className={classes.title}>
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
