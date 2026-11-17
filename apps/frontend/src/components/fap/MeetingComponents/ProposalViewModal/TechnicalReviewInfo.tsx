import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

import {
  InstrumentWithManagementTime,
  Proposal,
  TechnicalReview,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';
import { getFullUserName } from 'utils/user';

type FapProposalProps = {
  fapId: number;
  proposal: Proposal;
};

type TechnicalReviewInfoProps = {
  technicalReview?: TechnicalReview;
  instrument?: InstrumentWithManagementTime | null;
} & FapProposalProps;

const TechnicalReviewInfo = ({
  technicalReview,
  instrument,
  ...fapProposalArgs
}: TechnicalReviewInfoProps) => {
  if (!technicalReview) {
    return null;
  }

  return (
    <div data-cy="Fap-meeting-components-technical-review">
      <StyledPaper margin={[2, 0]}>
        <Typography
          variant="h6"
          sx={(theme) => ({
            marginTop: theme.spacing(2),
          })}
          gutterBottom
        >
          Technical review info - {instrument?.name}
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 500 }}>
            <TableBody>
              <TableRow key="statusAndTime">
                <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                  Status
                </TableCell>
                <TableCell width="25%">
                  {technicalReview?.status || '-'}
                </TableCell>
                <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                  Time allocation(
                  {fapProposalArgs.proposal.call?.allocationTimeUnit}s)
                </TableCell>
                <TableCell>{technicalReview?.timeAllocation || '-'}</TableCell>
              </TableRow>
              <TableRow key="comments">
                <TableCell sx={BOLD_TEXT_STYLE}>
                  Comments for the review panel
                </TableCell>
                <TableCell
                  dangerouslySetInnerHTML={{
                    __html: technicalReview?.publicComment || '-',
                  }}
                />
                <TableCell sx={BOLD_TEXT_STYLE}>Reviewer</TableCell>
                <TableCell>
                  {getFullUserName(technicalReview?.reviewer)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>
    </div>
  );
};

export default TechnicalReviewInfo;
