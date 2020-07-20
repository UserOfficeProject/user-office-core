import {
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  makeStyles,
} from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';

import { Proposal, BasicUserDetails, ReviewStatus } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

type ProposalDetailsProps = {
  proposal: Proposal;
};

const ProposalDetails: React.FC<ProposalDetailsProps> = ({ proposal }) => {
  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2),
    },
    textBold: {
      fontWeight: 'bold',
    },
  }))();

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
    <div data-cy="SEP-meeting-components-proposal-details">
      <StyledPaper margin={[0]}>
        <Typography variant="h6" className={classes.heading} gutterBottom>
          Proposal details
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="titleAndShortCode">
              <TableCell className={classes.textBold}>ID</TableCell>
              <TableCell>{proposal.shortCode}</TableCell>
              <TableCell className={classes.textBold}>Title</TableCell>
              <TableCell>{proposal.title}</TableCell>
            </TableRow>
            <TableRow key="abstractAndScore">
              <TableCell className={classes.textBold}>Abstract</TableCell>
              <TableCell>{proposal.abstract}</TableCell>
              <TableCell className={classes.textBold}>Average score</TableCell>
              <TableCell>{average(getGrades(proposal) as number[])}</TableCell>
            </TableRow>
            <TableRow key="principalinvestigatorAndStatus">
              <TableCell className={classes.textBold}>
                Principal Investigator
              </TableCell>
              <TableCell>{`${proposal.proposer.firstname} ${proposal.proposer.lastname}`}</TableCell>
              <TableCell className={classes.textBold}>Status</TableCell>
              <TableCell>{proposal.status}</TableCell>
            </TableRow>
            <TableRow key="coproposersAndCall">
              <TableCell className={classes.textBold}>Co-Proposers</TableCell>
              <TableCell>
                {proposal.users
                  .map(
                    (user: BasicUserDetails) =>
                      ` ${user.firstname} ${user.lastname}`
                  )
                  .toString()}
              </TableCell>
              <TableCell className={classes.textBold}>Call</TableCell>
              <TableCell>{proposal.call?.shortCode}</TableCell>
            </TableRow>
            <TableRow key="ranking">
              <TableCell className={classes.textBold}>Initial Rank</TableCell>
              <TableCell>{proposal.rankOrder}</TableCell>
              <TableCell className={classes.textBold}>Current Rank</TableCell>
              <TableCell>{proposal.rankOrder}</TableCell>
            </TableRow>
            <TableRow key="instrumentAndPdf">
              <TableCell className={classes.textBold}>Instrument</TableCell>
              <TableCell>{proposal.instrument?.name}</TableCell>
              <TableCell className={classes.textBold}>PDF</TableCell>
              <TableCell>Click here to view pdf</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </StyledPaper>
    </div>
  );
};

ProposalDetails.propTypes = {
  proposal: PropTypes.any.isRequired,
};

export default ProposalDetails;
