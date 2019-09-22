import React, { Fragment } from "react";
import {
  ProposalTemplate,
  ProposalData,
  ProposalTemplateField
} from "../model/ProposalModel";
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
  data: ProposalData;
  template: ProposalTemplate;
}) {
  if (!props.template || !props.data) {
    return <div>Loading...</div>;
  }

  const classes = makeStyles(theme => ({
    heading: {
      marginTop:theme.spacing(2)
    }
  }))();
  
  const allFields = props.template.getAllFields();
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
            {completedFields.map((row: ProposalTemplateField) => (
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
