import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import QuestionaryDetails from 'components/questionary/QuestionaryDetails';
import { ProposalSubsetSumbission } from 'models/ProposalModel';
import React, { Fragment, HTMLAttributes } from 'react';
import { database } from 'faker';

const useStyles = makeStyles(theme => ({
  heading: {
    marginTop: theme.spacing(2),
  },
}));

export default function ProposalQuestionaryReview(
  props: HTMLAttributes<any> & {
    data: ProposalSubsetSumbission;
  }
) {
  const classes = useStyles();

  if (!props.data.questionaryId) {
    return <div>Loading...</div>;
  }
  const questionary = props.data.questionary;
  const users = props.data.users || [];

  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Proposal information
      </Typography>
      <Table>
        <TableBody>
          <TableRow key="title">
            <TableCell>Title</TableCell>
            <TableCell>{props.data.title}</TableCell>
          </TableRow>
          <TableRow key="abstract">
            <TableCell>Abstract</TableCell>
            <TableCell>{props.data.abstract}</TableCell>
          </TableRow>
          <TableRow key="principalinvestigator">
            <TableCell>Principal Investigator</TableCell>
            <TableCell>{`${props.data.proposer.firstname} ${props.data.proposer.lastname}`}</TableCell>
          </TableRow>
          <TableRow key="coproposers">
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
      <QuestionaryDetails questionaryId={questionary.questionaryId!} />
    </Fragment>
  );
}
