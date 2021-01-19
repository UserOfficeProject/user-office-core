import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import React, { Fragment, HTMLAttributes } from 'react';

import UOLoader from 'components/common/UOLoader';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { ProposalSubsetSubmission } from 'models/ProposalSubmissionState';

const useStyles = makeStyles(theme => ({
  heading: {
    marginTop: theme.spacing(2),
  },
}));

export default function ProposalQuestionaryReview(
  props: HTMLAttributes<any> & {
    data: ProposalSubsetSubmission;
  }
) {
  const classes = useStyles();

  if (!props.data.questionaryId) {
    return <UOLoader style={{ marginLeft: '50%', marginTop: '100px' }} />;
  }
  const questionary = props.data.questionary;
  const users = props.data.users || [];

  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Proposal information
      </Typography>
      <Table size="small">
        <TableBody>
          <TableRow key="proposal-id">
            <TableCell>Proposal ID</TableCell>
            <TableCell width="35%">{props.data.shortCode}</TableCell>
          </TableRow>
          <TableRow key="title">
            <TableCell>Title</TableCell>
            <TableCell>{props.data.title}</TableCell>
          </TableRow>
          <TableRow key="abstract">
            <TableCell>Abstract</TableCell>
            <TableCell>{props.data.abstract}</TableCell>
          </TableRow>
          <TableRow key="principal-investigator">
            <TableCell>Principal Investigator</TableCell>
            <TableCell>{`${props.data.proposer.firstname} ${props.data.proposer.lastname}`}</TableCell>
          </TableRow>
          <TableRow key="co-proposers">
            <TableCell>Co-Proposers</TableCell>
            <TableCell>
              {users
                .map((user: any) => ` ${user.firstname} ${user.lastname}`)
                .toString()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Questionary
      </Typography>
      <QuestionaryDetails questionaryId={questionary.questionaryId} />
    </Fragment>
  );
}
