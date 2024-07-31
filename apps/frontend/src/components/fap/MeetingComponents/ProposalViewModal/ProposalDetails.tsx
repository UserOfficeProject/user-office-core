import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

import { Proposal } from 'generated/sdk';
import { useDownloadPDFProposal } from 'hooks/proposal/useDownloadPDFProposal';
import { StyledPaper } from 'styles/StyledComponents';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';
import { average, getGradesFromReviews } from 'utils/mathFunctions';
import { getFullUserName } from 'utils/user';

type ProposalDetailsProps = {
  proposal: Proposal;
  instrumentId: number;
};

const ProposalDetails = ({ proposal, instrumentId }: ProposalDetailsProps) => {
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
                <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                  ID
                </TableCell>
                <TableCell width="25%">{proposal.proposalId}</TableCell>
                <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                  Title
                </TableCell>
                <TableCell>{proposal.title}</TableCell>
              </TableRow>
              <TableRow key="abstractAndScore">
                <TableCell sx={BOLD_TEXT_STYLE}>Abstract</TableCell>
                <TableCell>{proposal.abstract}</TableCell>
                <TableCell sx={BOLD_TEXT_STYLE}>Average score</TableCell>
                <TableCell>
                  {average(getGradesFromReviews(proposal.reviews ?? [])) || '-'}
                </TableCell>
              </TableRow>
              <TableRow key="principalInvestigatorAndStatus">
                <TableCell sx={BOLD_TEXT_STYLE}>
                  Principal Investigator
                </TableCell>
                <TableCell>{getFullUserName(proposal.proposer)}</TableCell>
                <TableCell sx={BOLD_TEXT_STYLE}>Status</TableCell>
                <TableCell>{proposal.status?.name}</TableCell>
              </TableRow>
              <TableRow key="coProposersAndCall">
                <TableCell sx={BOLD_TEXT_STYLE}>Co-Proposers</TableCell>
                <TableCell>
                  {proposal.users
                    .map((user) => getFullUserName(user))
                    .join(', ')}
                </TableCell>
                <TableCell sx={BOLD_TEXT_STYLE}>Call</TableCell>
                <TableCell>{proposal.call?.shortCode}</TableCell>
              </TableRow>
              <TableRow key="ranking">
                <TableCell sx={BOLD_TEXT_STYLE}>
                  Initial Rank (by average score)
                </TableCell>
                <TableCell>
                  {average(getGradesFromReviews(proposal.reviews ?? [])) || '-'}
                </TableCell>
                <TableCell sx={BOLD_TEXT_STYLE}>Current Rank</TableCell>
                <TableCell>
                  {
                    proposal.fapMeetingDecisions?.find(
                      (fmd) => fmd.instrumentId === instrumentId
                    )?.rankOrder
                  }
                </TableCell>
              </TableRow>
              <TableRow key="instrumentAndPdf">
                <TableCell sx={BOLD_TEXT_STYLE}>Instrument</TableCell>
                <TableCell>
                  {proposal.instruments
                    ?.map((instrument) => instrument?.name)
                    .join(', ')}
                </TableCell>
                <TableCell sx={BOLD_TEXT_STYLE}>PDF</TableCell>
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

export default ProposalDetails;
