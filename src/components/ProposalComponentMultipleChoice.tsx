import React from "react";
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, makeStyles, InputLabel, Select, MenuItem } from "@material-ui/core";
import { IBasicComponentProps } from "./IBasicComponentProps";
import { ProposalErrorLabel } from "./ProposalErrorLabel";

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
  let { proposal_question_id, config, question } = templateField;
  let isError = (touched[proposal_question_id] && errors[proposal_question_id]) ? true : false;

  switch (templateField.config.variant) {
    
    case "dropdown":
      return (
      <FormControl className={classes.wrapper} error={isError}>
        <InputLabel htmlFor={proposal_question_id} shrink>{question}</InputLabel>
        <span>{templateField.config.small_label}</span>
        <Select id={proposal_question_id} name={proposal_question_id} value={templateField.value} onChange={evt => {
          templateField.value = (evt.target as HTMLInputElement).value;
          handleChange(evt); // letting Formik know that there was a change
          onComplete();
        }}>
          {(config.options as string[]).map(option => {
            return <MenuItem value={option} key={option}>{option}</MenuItem>;
          })}
        </Select>
        {isError && <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>}
      </FormControl>
      );

    default:
      return (
      <FormControl className={classes.wrapper} error={isError}>
        <FormLabel>{templateField.question}</FormLabel>
        <span>{templateField.config.small_label}</span>
        <RadioGroup id={templateField.proposal_question_id} name={templateField.proposal_question_id} onChange={evt => {
          templateField.value = (evt.target as HTMLInputElement).value;
          handleChange(evt); // letting Formik know that there was a change
          onComplete();
        }} value={templateField.value} className={config.options.length < 3
          ? classes.horizontalLayout
          : classes.verticalLayout}>
          {(config.options as string[]).map(option => {
            return (<FormControlLabel value={option} key={option} control={<Radio />} label={option} />);
          })}
        </RadioGroup>
        {isError && <ProposalErrorLabel>{errors[proposal_question_id]}</ProposalErrorLabel>}
      </FormControl>
      );
  }
}
