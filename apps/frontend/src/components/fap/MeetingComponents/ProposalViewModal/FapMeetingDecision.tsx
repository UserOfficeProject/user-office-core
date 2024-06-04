import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';

import {
  Maybe,
  Fap,
  FapMeetingDecision as FapMeetingDecisionType,
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
  fapMeetingDecision: Maybe<FapMeetingDecisionType>;
  faps: Maybe<Pick<Fap, 'id' | 'code'>[]>;
};

const FapMeetingDecision = ({
  fapMeetingDecision,
  faps,
}: FapMeetingDecisionProps) => {
  const classes = useStyles();

  return (
    <div data-cy="faps-meeting-components-decision">
      {faps?.map((fap) => (
        <StyledPaper key={fap.id} margin={[2, 0]}>
          <Typography
            variant="h6"
            component="h2"
            className={classes.heading}
            gutterBottom
          >
            {fap?.code} - Fap Meeting decision
          </Typography>
          <Table>
            <TableBody>
              <TableRow key="statusAndTime">
                <TableCell width="25%" className={classes.textBold}>
                  Rank
                </TableCell>
                <TableCell width="25%">
                  {fapMeetingDecision?.rankOrder || '-'}
                </TableCell>
                <TableCell width="25%" className={classes.textBold}>
                  Fap meeting recommendation
                </TableCell>
                <TableCell width="25%">
                  {fapMeetingDecision?.recommendation || '-'}
                </TableCell>
              </TableRow>
              <TableRow key="comments">
                <TableCell className={classes.textBold}>
                  Comment for management
                </TableCell>
                <TableCell
                  dangerouslySetInnerHTML={{
                    __html: fapMeetingDecision?.commentForManagement || '-',
                  }}
                />
                <TableCell className={classes.textBold}>
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
};

export default FapMeetingDecision;
