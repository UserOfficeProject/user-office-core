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

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import { AdministrationFormData } from 'components/proposal/ProposalAdmin';
import { TechnicalReview, Review, UserRole } from 'generated/sdk';
import { useSEPProposalData } from 'hooks/SEP/useSEPProposalData';
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
  proposalId: number;
  sepId: number;
  submitted: boolean;
  meetingSubmitted: (data: AdministrationFormData) => void;
  setProposalViewModalOpen: (isOpen: boolean) => void;
};

const SEPMeetingProposalViewModal: React.FC<SEPMeetingProposalViewModalProps> = ({
  proposalViewModalOpen,
  proposalId,
  sepId,
  submitted,
  meetingSubmitted,
  setProposalViewModalOpen,
}) => {
  const classes = useStyles();
  const hasWriteAccess = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.SEP_CHAIR,
    UserRole.SEP_SECRETARY,
  ]);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const finalHasWriteAccess = submitted ? isUserOfficer : hasWriteAccess;

  const { SEPProposalData, loading, setSEPProposalData } = useSEPProposalData(
    sepId,
    proposalId
  );

  const proposalData = SEPProposalData?.proposal ?? null;

  const handleClose = () => {
    setProposalViewModalOpen(false);
    setSEPProposalData(null);
  };

  const sepTimeAllocation = SEPProposalData?.sepTimeAllocation ?? null;

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
                  {loading || !SEPProposalData || !proposalData ? (
                    <UOLoader
                      style={{ marginLeft: '50%', marginTop: '20px' }}
                    />
                  ) : (
                    <>
                      <FinalRankingForm
                        closeModal={handleClose}
                        hasWriteAccess={finalHasWriteAccess}
                        proposalData={proposalData}
                        meetingSubmitted={data => {
                          setSEPProposalData({
                            ...SEPProposalData,
                            proposal: {
                              ...proposalData,
                              ...data,
                              rankOrder: data.rankOrder as number,
                            },
                          });
                          meetingSubmitted(data);
                        }}
                      />
                      <ProposalDetails proposal={proposalData} />
                      <TechnicalReviewInfo
                        hasWriteAccess={finalHasWriteAccess}
                        technicalReview={
                          proposalData.technicalReview as TechnicalReview
                        }
                        sepTimeAllocation={sepTimeAllocation}
                        onSepTimeAllocationEdit={sepTimeAllocation =>
                          setSEPProposalData({
                            ...SEPProposalData,
                            sepTimeAllocation,
                          })
                        }
                        proposalId={proposalData.id}
                        sepId={sepId}
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
  sepId: PropTypes.number.isRequired,
  submitted: PropTypes.bool.isRequired,
};

export default SEPMeetingProposalViewModal;
