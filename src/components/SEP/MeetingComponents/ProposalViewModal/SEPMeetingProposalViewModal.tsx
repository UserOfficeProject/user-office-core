import AppBar from '@material-ui/core/AppBar';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import createStyles from '@material-ui/core/styles/createStyles';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import { TransitionProps } from '@material-ui/core/transitions/transition';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';
import React, { Ref } from 'react';

import UOLoader from 'components/common/UOLoader';
import { AdministrationFormData } from 'components/proposal/ProposalAdmin';
import { TechnicalReview, Review } from 'generated/sdk';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { ContentContainer } from 'styles/StyledComponents';

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
  meetingSubmitted: (data: AdministrationFormData) => void;
};

const SEPMeetingProposalViewModal: React.FC<SEPMeetingProposalViewModalProps> = ({
  setProposalViewModalOpen,
  proposalViewModalOpen,
  proposalId,
  meetingSubmitted,
}) => {
  const classes = useStyles();
  const { proposalData, loading, setProposalData } = useProposalData(
    proposalId
  );

  const handleClose = () => {
    setProposalViewModalOpen(false);
    setProposalData(null);
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
                    <UOLoader
                      style={{ marginLeft: '50%', marginTop: '20px' }}
                    />
                  ) : (
                    <>
                      <FinalRankingForm
                        closeModal={handleClose}
                        proposalData={proposalData}
                        meetingSubmitted={data => {
                          setProposalData({
                            ...proposalData,
                            ...data,
                            rankOrder: data.rankOrder as number,
                          });
                          meetingSubmitted(data);
                        }}
                      />
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
  meetingSubmitted: PropTypes.func.isRequired,
};

export default SEPMeetingProposalViewModal;
