import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React, { Fragment } from 'react';

import {
  Maybe,
  FapMeetingDecision as FapMeetingDecisionType,
  Fap,
  Instrument,
} from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
  },
  textBold: {
    fontWeight: 'bold',
  },
}));

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
  const classes = useStyles();

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
              className={classes.heading}
              gutterBottom
            >
              {getFapCodeById(fmd.fapId)} - Fap Meeting decision (Instrument:{' '}
              {getInstrumentNameById(fmd.instrumentId)})
            </Typography>
            <Table>
              <TableBody>
                <TableRow key="statusAndTime">
                  <TableCell width="25%" className={classes.textBold}>
                    Rank
                  </TableCell>
                  <TableCell width="25%">{fmd.rankOrder || '-'}</TableCell>
                  <TableCell width="25%" className={classes.textBold}>
                    Fap meeting recommendation
                  </TableCell>
                  <TableCell width="25%">{fmd.recommendation || '-'}</TableCell>
                </TableRow>
                <TableRow key="comments">
                  <TableCell className={classes.textBold}>
                    Comment for management
                  </TableCell>
                  <TableCell
                    dangerouslySetInnerHTML={{
                      __html: fmd.commentForManagement || '-',
                    }}
                  />
                  <TableCell className={classes.textBold}>
                    Comment for user
                  </TableCell>
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
