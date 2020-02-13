import React, { Fragment, HTMLAttributes } from "react";
import { getAllFields } from "../models/ProposalModelFunctions";
import {
  Table,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  makeStyles
} from "@material-ui/core";
import { Proposal, QuestionaryField } from "../generated/sdk";

export default function ProposalQuestionaryReview(
  props: HTMLAttributes<any> & {
    data: Proposal;
  }
) {
  const questionary = props.data.questionary!;

  if (!props.data) {
    return <div>Loading...</div>;
  }

  const classes = makeStyles(theme => ({
    heading: {
      marginTop: theme.spacing(2)
    }
  }))();

  const allFields = getAllFields(questionary) as QuestionaryField[];
  const completedFields = allFields.filter(field => {
    return !!field.value;
  });

  const users = props.data.users || [];
  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Information
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
          {completedFields.map((row: QuestionaryField) => (
            <TableRow key={row.proposal_question_id}>
              <TableCell>{row.question}</TableCell>
              <TableCell>{row.value.toString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Fragment>
  );
}
