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
import React, { Ref } from 'react';

import SimpleTabs from 'components/common/TabPanel';
import UOLoader from 'components/common/UOLoader';
import ProposalQuestionaryReview from 'components/review/ProposalQuestionaryReview';
import TechnicalReviewInformation from 'components/review/TechnicalReviewInformation';
import { useProposalData } from 'hooks/proposal/useProposalData';
import { ContentContainer } from 'styles/StyledComponents';

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

type SEPProposalViewModalProps = {
  proposalViewModalOpen: boolean;
  proposalId: number;
  setProposalViewModalOpen: (isOpen: boolean) => void;
};

const SEPProposalViewModal: React.FC<SEPProposalViewModalProps> = ({
  proposalViewModalOpen,
  proposalId,
  setProposalViewModalOpen,
}) => {
  const classes = useStyles();

  const { proposalData, loading } = useProposalData(proposalId);

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
              SEP - Proposal View
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
                    <SimpleTabs
                      tabNames={['Proposal Information', 'Technical Review']}
                    >
                      <ProposalQuestionaryReview data={proposalData} />
                      <TechnicalReviewInformation
                        data={proposalData.technicalReview}
                      />
                    </SimpleTabs>
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

export default SEPProposalViewModal;
