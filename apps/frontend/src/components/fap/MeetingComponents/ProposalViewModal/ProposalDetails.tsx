import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';

import { Proposal } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { StyledPaper } from 'styles/StyledComponents';
import { average, getGradesFromReviews } from 'utils/mathFunctions';
import { getFullUserName } from 'utils/user';

type ProposalDetailsProps = {
  proposal: Proposal;
};

const ProposalDetails = ({ proposal }: ProposalDetailsProps) => {
  const downloadPDFProposal = useDownloadPDFProposal();

  return (
    <div data-cy="Fap-meeting-components-proposal-details">
      <StyledPaper>
        <Typography
          variant="h6"
          sx={(theme) => ({
            marginTop: theme.spacing(2),
          })}
          gutterBottom
        >
          Proposal details
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 500 }}>
            <TableBody>
              <TableRow key="titleAndShortCode">
                <TableCell width="25%" sx={{ fontWeight: 'bold' }}>
                  ID
                </TableCell>
                <TableCell width="25%">{proposal.proposalId}</TableCell>
                <TableCell width="25%" sx={{ fontWeight: 'bold' }}>
                  Title
                </TableCell>
                <TableCell>{proposal.title}</TableCell>
              </TableRow>
              <TableRow key="abstractAndScore">
                <TableCell sx={{ fontWeight: 'bold' }}>Abstract</TableCell>
                <TableCell>{proposal.abstract}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Average score</TableCell>
                <TableCell>
                  {average(getGradesFromReviews(proposal.reviews ?? [])) || '-'}
                </TableCell>
              </TableRow>
              <TableRow key="principalInvestigatorAndStatus">
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Principal Investigator
                </TableCell>
                <TableCell>{getFullUserName(proposal.proposer)}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell>{proposal.status?.name}</TableCell>
              </TableRow>
              <TableRow key="coProposersAndCall">
                <TableCell sx={{ fontWeight: 'bold' }}>Co-Proposers</TableCell>
                <TableCell>
                  {proposal.users
                    .map((user) => getFullUserName(user))
                    .join(', ')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Call</TableCell>
                <TableCell>{proposal.call?.shortCode}</TableCell>
              </TableRow>
              <TableRow key="ranking">
                <TableCell sx={{ fontWeight: 'bold' }}>
                  Initial Rank (by average score)
                </TableCell>
                <TableCell>
                  {average(getGradesFromReviews(proposal.reviews ?? [])) || '-'}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Current Rank</TableCell>
                <TableCell>{proposal.fapMeetingDecision?.rankOrder}</TableCell>
              </TableRow>
              <TableRow key="instrumentAndPdf">
                <TableCell sx={{ fontWeight: 'bold' }}>Instrument</TableCell>
                <TableCell>
                  {proposal.instruments
                    ?.map((instrument) => instrument?.name)
                    .join(', ')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>PDF</TableCell>
                <TableCell>
                  <Button
                    onClick={() =>
                      downloadPDFProposal([proposal.primaryKey], proposal.title)
                    }
                    variant="text"
                  >
                    Click here to view pdf
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    </div>
  );
};

ProposalDetails.propTypes = {
  proposal: PropTypes.any.isRequired,
};

export default ProposalDetails;
