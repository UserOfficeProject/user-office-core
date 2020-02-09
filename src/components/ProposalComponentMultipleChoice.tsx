import React, { useState, useContext } from "react";
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
import { EventType } from "../models/ProposalSubmissionModel";
import { ProposalSubmissionContext } from "./ProposalContainer";

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

  let { templateField, touched, errors, handleChange } = props;
  let { proposal_question_id, value } = templateField;
  let [stateValue, setStateValue] = useState(value);
  const fieldError = getIn(errors, proposal_question_id);
  const isError = getIn(touched, proposal_question_id) && !!fieldError;
  const config = templateField.config as SelectionFromOptionsConfig;
  const { dispatch } = useContext(ProposalSubmissionContext);

  switch (config.variant) {
    case "dropdown":
      return (
        <FormControl fullWidth>
          <TextField
            id={proposal_question_id}
            name={proposal_question_id}
            value={stateValue}
            label={templateField.question}
            select
            onChange={(evt: any) => {
              setStateValue((evt.target as HTMLInputElement).value);
              handleChange(evt); // letting Formik know that there was a change
              dispatch({
                type: EventType.FIELD_CHANGED,
                payload: {
                  id: proposal_question_id,
                  newValue: (evt.target as HTMLInputElement).value
                }
              });
            }}
            SelectProps={{
              MenuProps: {}
            }}
            error={isError}
            helperText={config.small_label}
            margin="normal"
            required={config.required ? true : false}
          >
            {config.options.map(option => {
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
              setStateValue((evt.target as HTMLInputElement).value);
              handleChange(evt); // letting Formik know that there was a change
              dispatch({
                type: EventType.FIELD_CHANGED,
                payload: {
                  id: proposal_question_id,
                  newValue: (evt.target as HTMLInputElement).value
                }
              });
            }}
            value={stateValue}
            className={
              config.options!.length < 3
                ? classes.horizontalLayout
                : classes.verticalLayout
            }
          >
            {config.options.map(option => {
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
