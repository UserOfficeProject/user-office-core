import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import React from 'react';

import { Proposal, BasicUserDetails } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { StyledPaper } from 'styles/StyledComponents';
import { average, getGrades } from 'utils/mathFunctions';

type ProposalDetailsProps = {
  proposal: Proposal;
};

const ProposalDetails: React.FC<ProposalDetailsProps> = ({ proposal }) => {
  const downloadPDFProposal = useDownloadPDFProposal();
  const classes = makeStyles((theme) => ({
    heading: {
      marginTop: theme.spacing(2),
    },
    textBold: {
      fontWeight: 'bold',
    },
  }))();

  return (
    <div data-cy="SEP-meeting-components-proposal-details">
      <StyledPaper margin={[0]}>
        <Typography variant="h6" className={classes.heading} gutterBottom>
          Proposal details
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="titleAndShortCode">
              <TableCell width="25%" className={classes.textBold}>
                ID
              </TableCell>
              <TableCell width="25%">{proposal.shortCode}</TableCell>
              <TableCell width="25%" className={classes.textBold}>
                Title
              </TableCell>
              <TableCell>{proposal.title}</TableCell>
            </TableRow>
            <TableRow key="abstractAndScore">
              <TableCell className={classes.textBold}>Abstract</TableCell>
              <TableCell>{proposal.abstract}</TableCell>
              <TableCell className={classes.textBold}>Average score</TableCell>
              <TableCell>
                {average(getGrades(proposal.reviews)) || '-'}
              </TableCell>
            </TableRow>
            <TableRow key="principalInvestigatorAndStatus">
              <TableCell className={classes.textBold}>
                Principal Investigator
              </TableCell>
              <TableCell>{`${proposal.proposer?.firstname} ${proposal.proposer?.lastname}`}</TableCell>
              <TableCell className={classes.textBold}>Status</TableCell>
              <TableCell>{proposal.status?.name}</TableCell>
            </TableRow>
            <TableRow key="coProposersAndCall">
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
              <TableCell className={classes.textBold}>
                Initial Rank (by average score)
              </TableCell>
              <TableCell>
                {average(getGrades(proposal.reviews)) || '-'}
              </TableCell>
              <TableCell className={classes.textBold}>Current Rank</TableCell>
              <TableCell>{proposal.sepMeetingDecision?.rankOrder}</TableCell>
            </TableRow>
            <TableRow key="instrumentAndPdf">
              <TableCell className={classes.textBold}>Instrument</TableCell>
              <TableCell>{proposal.instrument?.name}</TableCell>
              <TableCell className={classes.textBold}>PDF</TableCell>
              <TableCell>
                <Button
                  onClick={() =>
                    downloadPDFProposal([proposal.id], proposal.title)
                  }
                  color="primary"
                >
                  Click here to view pdf
                </Button>
              </TableCell>
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
