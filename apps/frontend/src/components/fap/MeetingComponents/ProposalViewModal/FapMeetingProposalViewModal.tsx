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
  FapMeetingDecision,
  Proposal,
} from 'generated/sdk';
import { useFapProposalData } from 'hooks/fap/useFapProposalData';

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

type FapMeetingProposalViewModalProps = {
  proposalViewModalOpen: boolean;
  proposalPk?: number | null;
  fapId: number;
  meetingSubmitted: (data: FapMeetingDecision) => void;
  setProposalViewModalOpen: (isOpen: boolean) => void;
};

const FapMeetingProposalViewModal = ({
  proposalViewModalOpen,
  proposalPk,
  fapId,
  meetingSubmitted,
  setProposalViewModalOpen,
}: FapMeetingProposalViewModalProps) => {
  const classes = useStyles();
  const hasWriteAccess = useCheckAccess([
    UserRole.USER_OFFICER,
    UserRole.FAP_CHAIR,
    UserRole.FAP_SECRETARY,
  ]);
  const isUserOfficer = useCheckAccess([UserRole.USER_OFFICER]);

  const { FapProposalData, loading, setFapProposalData } = useFapProposalData(
    fapId,
    proposalPk
  );

  const finalHasWriteAccess = FapProposalData?.instrumentSubmitted
    ? isUserOfficer
    : hasWriteAccess;

  const proposalData = (FapProposalData?.proposal ?? null) as Proposal;

  const handleClose = () => {
    setProposalViewModalOpen(false);
  };

  const fapTimeAllocation = FapProposalData?.fapTimeAllocation ?? null;

  return (
    <>
      <Dialog
        open={proposalViewModalOpen}
        fullScreen
        onClose={(): void => handleClose()}
        TransitionComponent={Transition}
        data-cy="Fap-meeting-modal"
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
              Fap Meeting Components - Proposal View: {proposalData?.title} (
              {proposalData?.proposalId})
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent>
          <Grid container>
            <Grid item xs={12}>
              <div data-cy="Fap-meeting-components-proposal-view">
                {loading || !FapProposalData || !proposalData ? (
                  <UOLoader style={{ marginLeft: '50%', marginTop: '20px' }} />
                ) : (
                  <>
                    <FinalRankingForm
                      closeModal={handleClose}
                      hasWriteAccess={finalHasWriteAccess}
                      proposalData={proposalData}
                      meetingSubmitted={(data) => {
                        setFapProposalData({
                          ...FapProposalData,
                          proposal: {
                            ...proposalData,
                            fapMeetingDecision: data,
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
                      fapTimeAllocation={fapTimeAllocation}
                      onFapTimeAllocationEdit={(fapTimeAllocation) =>
                        setFapProposalData({
                          ...FapProposalData,
                          fapTimeAllocation,
                        })
                      }
                      proposal={proposalData}
                      fapId={fapId}
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

export default FapMeetingProposalViewModal;
