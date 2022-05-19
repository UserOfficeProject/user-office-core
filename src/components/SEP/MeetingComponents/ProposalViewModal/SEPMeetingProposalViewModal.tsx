import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import { TransitionProps } from '@mui/material/transitions/transition';
import Typography from '@mui/material/Typography';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import { useCheckAccess } from 'components/common/Can';
import UOLoader from 'components/common/UOLoader';
import {
  TechnicalReview,
  Review,
  UserRole,
  SepMeetingDecision,
} from 'generated/sdk';
import { useSEPProposalData } from 'hooks/SEP/useSEPProposalData';

import ExternalReviews from './ExternalReviews';
import FinalRankingForm from './FinalRankingForm';
import ProposalDetails from './ProposalDetails';
import TechnicalReviewInfo from './TechnicalReviewInfo';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBar: {
      position: 'relative',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
      color: 'white',
    },
  })
);

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type SEPMeetingProposalViewModalProps = {
  proposalViewModalOpen: boolean;
  proposalPk?: number | null;
  sepId: number;
  meetingSubmitted: (data: SepMeetingDecision) => void;
  setProposalViewModalOpen: (isOpen: boolean) => void;
};

const SEPMeetingProposalViewModal: React.FC<
  SEPMeetingProposalViewModalProps
> = ({
  proposalViewModalOpen,
  proposalPk,
  sepId,
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

  const { SEPProposalData, loading, setSEPProposalData } = useSEPProposalData(
    sepId,
    proposalPk
  );

  const finalHasWriteAccess = SEPProposalData?.instrumentSubmitted
    ? isUserOfficer
    : hasWriteAccess;

  const proposalData = SEPProposalData?.proposal ?? null;

  const handleClose = () => {
    setProposalViewModalOpen(false);
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
              data-cy="close-modal"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              SEP Meeting Components - Proposal View
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <div data-cy="SEP-meeting-components-proposal-view">
                {loading || !SEPProposalData || !proposalData ? (
                  <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />
                ) : (
                  <>
                    <FinalRankingForm
                      closeModal={handleClose}
                      hasWriteAccess={finalHasWriteAccess}
                      proposalData={proposalData}
                      meetingSubmitted={(data) => {
                        setSEPProposalData({
                          ...SEPProposalData,
                          proposal: {
                            ...proposalData,
                            sepMeetingDecision: data,
                          },
                        });
                        meetingSubmitted(data);
                      }}
                    />
                    <ExternalReviews
                      reviews={proposalData.reviews as Review[]}
                    />
                    <TechnicalReviewInfo
                      hasWriteAccess={finalHasWriteAccess}
                      technicalReview={
                        proposalData.technicalReview as TechnicalReview
                      }
                      sepTimeAllocation={sepTimeAllocation}
                      onSepTimeAllocationEdit={(sepTimeAllocation) =>
                        setSEPProposalData({
                          ...SEPProposalData,
                          sepTimeAllocation,
                        })
                      }
                      proposal={proposalData}
                      sepId={sepId}
                    />
                    <ProposalDetails proposal={proposalData} />
                  </>
                )}
              </div>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SEPMeetingProposalViewModal;
