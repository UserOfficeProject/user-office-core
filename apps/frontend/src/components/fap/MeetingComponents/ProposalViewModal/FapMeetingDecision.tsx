import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React from 'react';

import {
  Maybe,
  Fap,
  FapMeetingDecision as FapMeetingDecisionType,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

type FapMeetingDecisionProps = {
  fapMeetingDecision: Maybe<FapMeetingDecisionType>;
  faps: Maybe<Pick<Fap, 'id' | 'code'>[]>;
};

const FapMeetingDecision = ({
  fapMeetingDecision,
  faps,
}: FapMeetingDecisionProps) => (
  <div data-cy="faps-meeting-components-decision">
    {faps?.map((fap) => (
      <StyledPaper key={fap.id} margin={[2, 0]}>
        <Typography
          variant="h6"
          component="h2"
          sx={(theme) => ({
            marginTop: theme.spacing(2),
          })}
          gutterBottom
        >
          {fap?.code} - Fap Meeting decision
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="statusAndTime">
              <TableCell
                width="25%"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Rank
              </TableCell>
              <TableCell width="25%">
                {fapMeetingDecision?.rankOrder || '-'}
              </TableCell>
              <TableCell
                width="25%"
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Fap meeting recommendation
              </TableCell>
              <TableCell width="25%">
                {fapMeetingDecision?.recommendation || '-'}
              </TableCell>
            </TableRow>
            <TableRow key="comments">
              <TableCell
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Comment for management
              </TableCell>
              <TableCell
                dangerouslySetInnerHTML={{
                  __html: fapMeetingDecision?.commentForManagement || '-',
                }}
              />
              <TableCell
                sx={{
                  fontWeight: 'bold',
                }}
              >
                Comment for user
              </TableCell>
              <TableCell
                dangerouslySetInnerHTML={{
                  __html: fapMeetingDecision?.commentForUser || '-',
                }}
              />
            </TableRow>
          </TableBody>
        </Table>
      </StyledPaper>
    ))}
  </div>
);

export default FapMeetingDecision;
