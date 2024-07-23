import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { Fragment } from 'react';

import {
  Maybe,
  FapMeetingDecision as FapMeetingDecisionType,
  Fap,
  Instrument,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';
import { BOLD_TEXT_STYLE } from 'utils/helperFunctions';

type FapMeetingDecisionProps = {
  fapMeetingDecisions: Maybe<FapMeetingDecisionType[]>;
  faps: Pick<Fap, 'code' | 'id'>[] | null;
  instruments: (Pick<Instrument, 'id' | 'name'> | null)[] | null;
};

const FapMeetingDecision = ({
  fapMeetingDecisions,
  faps,
  instruments,
}: FapMeetingDecisionProps) => {
  if (!fapMeetingDecisions?.length) {
    return null;
  }

  const getFapCodeById = (id?: number) => faps?.find((f) => f.id === id)?.code;
  const getInstrumentNameById = (id?: number) =>
    instruments?.find((i) => i?.id === id)?.name;

  return (
    <div data-cy="faps-meeting-components-decision">
      <StyledPaper margin={[2, 0]}>
        {fapMeetingDecisions.map((fmd) => (
          <Fragment key={fmd.instrumentId}>
            <Typography
              variant="h6"
              component="h2"
              sx={(theme) => ({
                marginTop: theme.spacing(2),
              })}
              gutterBottom
            >
              {getFapCodeById(fmd.fapId)} - Fap Meeting decision (Instrument:{' '}
              {getInstrumentNameById(fmd.instrumentId)})
            </Typography>
            <Table>
              <TableBody>
                <TableRow key="statusAndTime">
                  <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                    Rank
                  </TableCell>
                  <TableCell width="25%">{fmd.rankOrder || '-'}</TableCell>
                  <TableCell width="25%" sx={BOLD_TEXT_STYLE}>
                    Fap meeting recommendation
                  </TableCell>
                  <TableCell width="25%">{fmd.recommendation || '-'}</TableCell>
                </TableRow>
                <TableRow key="comments">
                  <TableCell sx={BOLD_TEXT_STYLE}>
                    Comment for management
                  </TableCell>
                  <TableCell
                    dangerouslySetInnerHTML={{
                      __html: fmd.commentForManagement || '-',
                    }}
                  />
                  <TableCell sx={BOLD_TEXT_STYLE}>Comment for user</TableCell>
                  <TableCell
                    dangerouslySetInnerHTML={{
                      __html: fmd.commentForUser || '-',
                    }}
                  />
                </TableRow>
              </TableBody>
            </Table>
          </Fragment>
        ))}
      </StyledPaper>
    </div>
  );
};

export default FapMeetingDecision;
