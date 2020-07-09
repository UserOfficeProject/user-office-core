import { TransitionProps } from '@material-ui/core/transitions/transition';

import {
  makeStyles,
  Theme,
  createStyles,
  Slide,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  DialogContent,
  Grid,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import React, { Ref } from 'react';

import { TechnicalReview, Review } from '../../../../generated/sdk';
import { useProposalData } from '../../../../hooks/useProposalData';
import { ContentContainer } from '../../../../styles/StyledComponents';
import ExternalReviews from './ExternalReviews';
import FinalRankingForm from './FinalRankingForm';
import ProposalDetails from './ProposalDetails';
import TechnicalReviewInfo from './TechnicalReviewInfo';

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

type SEPMeetingProposalViewModalProps = {
  proposalViewModalOpen: boolean;
  setProposalViewModalOpen: (isOpen: boolean) => void;
  proposalId: number;
};

const SEPMeetingProposalViewModal: React.FC<SEPMeetingProposalViewModalProps> = ({
  setProposalViewModalOpen,
  proposalViewModalOpen,
  proposalId,
}) => {
  const classes = useStyles();
  const { proposalData, loading } = useProposalData(proposalId);

  if (!proposalId) {
    return null;
  }

  const handleClose = () => {
    setProposalViewModalOpen(false);
  };

  return (
    <>
      <Dialog
        open={proposalViewModalOpen}
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
              SEP Meeting Components - Proposal View
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <ContentContainer>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <div data-cy="SEP-meeting-components-proposal-view">
                  {loading || !proposalData ? (
                    <div>Loading...</div>
                  ) : (
                    <>
                      <FinalRankingForm closeModal={handleClose} />
                      <ProposalDetails proposal={proposalData} />
                      <TechnicalReviewInfo
                        technicalReview={
                          proposalData.technicalReview as TechnicalReview
                        }
                      />
                      <ExternalReviews
                        reviews={proposalData.reviews as Review[]}
                      />
                    </>
                  )}
                </div>
              </Grid>
            </Grid>
          </ContentContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

SEPMeetingProposalViewModal.propTypes = {
  proposalId: PropTypes.number.isRequired,
  proposalViewModalOpen: PropTypes.bool.isRequired,
  setProposalViewModalOpen: PropTypes.func.isRequired,
};

export default SEPMeetingProposalViewModal;
