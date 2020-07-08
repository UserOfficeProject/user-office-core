import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import {
  Proposal,
  ReviewStatus,
  BasicUserDetails,
} from '../../../generated/sdk';
import { useProposalData } from '../../../hooks/useProposalData';
import {
  ContentContainer,
  StyledPaper,
} from '../../../styles/StyledComponents';

type SEPMeetingProposalViewProps = {
  proposalId: number;
};

const SEPMeetingProposalView: React.FC<SEPMeetingProposalViewProps> = ({
  proposalId,
}) => {
  const { proposalData, loading } = useProposalData(proposalId);
  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2),
    },
    textBold: {
      fontWeight: 'bold',
    },
  }))();

  if (loading || !proposalData) {
    return <div>Loading...</div>;
  }

  const getGrades = (proposal: Proposal) =>
    proposal.reviews
      ?.filter(review => review.status === ReviewStatus.SUBMITTED)
      .map(review => review.grade) ?? [];

  const average = (numbers: number[]) => {
    const sum = numbers.reduce(function(sum, value) {
      return sum + value;
    }, 0);

    const avg = sum / numbers.length;

    return avg.toPrecision(3);
  };

  return (
    <ContentContainer>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledPaper margin={[0]}>
            <div data-cy="SEP-meeting-components-proposal-view">
              <Typography variant="h6" className={classes.heading} gutterBottom>
                Proposal details
              </Typography>
              <Table>
                <TableBody>
                  <TableRow key="titleAndShortCode">
                    <TableCell className={classes.textBold}>ID</TableCell>
                    <TableCell>{proposalData.shortCode}</TableCell>
                    <TableCell className={classes.textBold}>Title</TableCell>
                    <TableCell>{proposalData.title}</TableCell>
                  </TableRow>
                  <TableRow key="abstractAndScore">
                    <TableCell className={classes.textBold}>Abstract</TableCell>
                    <TableCell>{proposalData.abstract}</TableCell>
                    <TableCell className={classes.textBold}>
                      Average score
                    </TableCell>
                    <TableCell>
                      {average(getGrades(proposalData) as number[])}
                    </TableCell>
                  </TableRow>
                  <TableRow key="principalinvestigatorAndStatus">
                    <TableCell className={classes.textBold}>
                      Principal Investigator
                    </TableCell>
                    <TableCell>{`${proposalData.proposer.firstname} ${proposalData.proposer.lastname}`}</TableCell>
                    <TableCell className={classes.textBold}>Status</TableCell>
                    <TableCell>{proposalData.status}</TableCell>
                  </TableRow>
                  <TableRow key="coproposersAndCall">
                    <TableCell className={classes.textBold}>
                      Co-Proposers
                    </TableCell>
                    <TableCell>
                      {proposalData.users
                        .map(
                          (user: BasicUserDetails) =>
                            ` ${user.firstname} ${user.lastname}`
                        )
                        .toString()}
                    </TableCell>
                    <TableCell className={classes.textBold}>Call</TableCell>
                    <TableCell>{proposalData.call?.shortCode}</TableCell>
                  </TableRow>
                  <TableRow key="ranking">
                    <TableCell className={classes.textBold}>
                      Initial Rank
                    </TableCell>
                    <TableCell>{proposalData.rankOrder}</TableCell>
                    <TableCell className={classes.textBold}>
                      Current Rank
                    </TableCell>
                    <TableCell>{proposalData.rankOrder}</TableCell>
                  </TableRow>
                  <TableRow key="ranking">
                    <TableCell className={classes.textBold}>
                      Instrument
                    </TableCell>
                    <TableCell>{proposalData.instrument?.name}</TableCell>
                    <TableCell className={classes.textBold}>PDF</TableCell>
                    <TableCell>Click here to view pdf</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Typography variant="h6" className={classes.heading} gutterBottom>
                Technical review info
              </Typography>
              <Table>
                <TableBody>
                  <TableRow key="statusAndTime">
                    <TableCell className={classes.textBold}>Status</TableCell>
                    <TableCell>
                      {proposalData.technicalReview?.status || '-'}
                    </TableCell>
                    <TableCell className={classes.textBold}>
                      Time allocation
                    </TableCell>
                    <TableCell>
                      {proposalData.technicalReview?.timeAllocation || '-'}
                    </TableCell>
                  </TableRow>
                  <TableRow key="comments">
                    <TableCell className={classes.textBold}>
                      Internal comment
                    </TableCell>
                    <TableCell>
                      {proposalData.technicalReview?.comment || '-'}
                    </TableCell>
                    <TableCell className={classes.textBold}>
                      Public comment
                    </TableCell>
                    <TableCell>
                      {proposalData.technicalReview?.publicComment || '-'}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

SEPMeetingProposalView.propTypes = {
  proposalId: PropTypes.number.isRequired,
};

export default SEPMeetingProposalView;
