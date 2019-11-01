import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  makeStyles,
  MenuItem,
  TextField
} from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { getIn } from "formik";

export function ProposalComponentMultipleChoice(props: IBasicComponentProps) {
  const classes = makeStyles({
    horizontalLayout: {
      flexDirection: "row"
    },
    verticalLayout: {
      flexDirection: "column"
    },
    wrapper: {
      margin: "18px 0 0 0",
      display: "flex"
    }
  })();

  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;

  switch (templateField.config.variant) {
    case "dropdown":
      return (
        <FormControl error={isError} fullWidth>
          <TextField
            id={proposal_question_id}
            name={proposal_question_id}
            value={templateField.value}
            label={templateField.question}
            select
            onChange={(evt: any) => {
              templateField.value = (evt.target as HTMLInputElement).value;
              handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            SelectProps={{
              MenuProps: {}
            }}
            helperText={templateField.config.small_label}
            margin="normal"
          >
            {(config.options as string[]).map(option => {
              return (
                <MenuItem value={option} key={option}>
                  {option}
                </MenuItem>
              );
            })}
          </TextField>
        </FormControl>
      );

    default:
      return (
        <FormControl className={classes.wrapper} error={isError}>
          <FormLabel>{templateField.question}</FormLabel>
          <span>{templateField.config.small_label}</span>
          <RadioGroup
            id={templateField.proposal_question_id}
            name={templateField.proposal_question_id}
            onChange={evt => {
              templateField.value = (evt.target as HTMLInputElement).value;
              handleChange(evt); // letting Formik know that there was a change
              onComplete();
            }}
            value={templateField.value}
            className={
              config.options!.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {(config.options as string[]).map(option => {
              return (
                <FormControlLabel
                  value={option}
                  key={option}
                  control={<Radio />}
                  label={option}
                />
              );
            })}
          </RadioGroup>
        </FormControl>
      );
  }
}
