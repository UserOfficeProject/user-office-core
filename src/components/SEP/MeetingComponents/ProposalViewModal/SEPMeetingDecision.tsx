import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import React from 'react';

import { Maybe, Sep, SepMeetingDecision } from 'generated/sdk';
import { StyledPaper } from 'styles/StyledComponents';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginTop: theme.spacing(2),
  },
  textBold: {
    fontWeight: 'bold',
  },
}));

type SEPMeetingDecisionProps = {
  sepMeetingDecision: Maybe<SepMeetingDecision>;
  sep: Maybe<Pick<Sep, 'id' | 'code'>>;
};

const SEPMeetingDecision: React.FC<SEPMeetingDecisionProps> = ({
  sepMeetingDecision,
  sep,
}) => {
  const classes = useStyles();

  return (
    <div data-cy="SEP-meeting-components-decision">
      <StyledPaper margin={[2, 0]}>
        <Typography
          variant="h6"
          component="h2"
          className={classes.heading}
          gutterBottom
        >
          {sep?.code} - SEP Meeting decision
        </Typography>
        <Table>
          <TableBody>
            <TableRow key="statusAndTime">
              <TableCell width="25%" className={classes.textBold}>
                Rank
              </TableCell>
              <TableCell width="25%">
                {sepMeetingDecision?.rankOrder || '-'}
              </TableCell>
              <TableCell width="25%" className={classes.textBold}>
                SEP meeting recommendation
              </TableCell>
              <TableCell width="25%">
                {sepMeetingDecision?.recommendation || '-'}
              </TableCell>
            </TableRow>
            <TableRow key="comments">
              <TableCell className={classes.textBold}>
                Comment for management
              </TableCell>
              <TableCell
                dangerouslySetInnerHTML={{
                  __html: sepMeetingDecision?.commentForManagement || '-',
                }}
              />
              <TableCell className={classes.textBold}>
                Comment for user
              </TableCell>
              <TableCell
                dangerouslySetInnerHTML={{
                  __html: sepMeetingDecision?.commentForUser || '-',
                }}
              />
            </TableRow>
          </TableBody>
        </Table>
      </StyledPaper>
    </div>
  );
};

export default SEPMeetingDecision;
