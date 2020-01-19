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
import { SelectionFromOptionsConfig } from "../generated/sdk";

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
      display: "inline-flex"
    },
    label: {
      marginTop: "10px",
      marginRight: "5px"
    }
  })();

  let { templateField, onComplete, touched, errors, handleChange } = props;
  let { proposal_question_id, config } = templateField;
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const conf = config as SelectionFromOptionsConfig;

  switch (conf.variant) {
    case "dropdown":
      return (
        <FormControl fullWidth>
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
            error={isError}
            helperText={conf.small_label}
            margin="normal"
            required={config.required ? true : false}
          >
            {conf.options.map(option => {
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
        <FormControl
          className={classes.wrapper}
          required={config.required ? true : false}
          error={isError}
        >
          <FormLabel className={classes.label}>
            {templateField.question}
          </FormLabel>
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
              conf.options!.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {conf.options.map(option => {
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
