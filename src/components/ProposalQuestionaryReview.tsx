import React, { Fragment } from "react";
import {
  QuestionaryField} from "../model/ProposalModel";
import { ProposalInformation } from "../model/ProposalModel";
import { getAllFields } from "../model/ProposalModelFunctions";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  makeStyles
} from "@material-ui/core";

export default function ProposaQuestionaryReview(props: {
  data: ProposalInformation;
}) {

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

  return (
    <Fragment>
      <Typography variant="h6" className={classes.heading} gutterBottom>
        Questionary review
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedFields.map((row: QuestionaryField) => (
              <TableRow key={row.proposal_question_id}>
                <TableCell>{row.question}</TableCell>
                <TableCell>{row.value.toString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Fragment>
  );
}
