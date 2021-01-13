import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import { getIn } from 'formik';
import React, { useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import { NumberInputConfig } from 'generated/sdk';

const useStyles = makeStyles(theme => ({
  unitField: {
    paddingRight: theme.spacing(1),
    alignSelf: 'flex-end',
  },
  singleUnit: {
    alignItems: 'flex-end',
    display: 'flex',
    height: '100%',
    fontSize: '17px',
    padding: '0px 5px',
  },
  label: {
    marginTop: '10px',
    marginRight: '5px',
  },
  smallLabel: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#999',
  },
  container: {
    paddingBottom: theme.spacing(2),
  },
}));

type AcceptableUserInput = number | '';

export function QuestionaryComponentNumber(props: BasicComponentProps) {
  const {
    answer,
    onComplete,
    formikProps: { errors, touched },
  } = props;
  const {
    question: { proposalQuestionId, question },
  } = answer;
  const config = answer.config as NumberInputConfig;
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const [stateValue, setStateValue] = useState<{
    value: AcceptableUserInput;
    unit: string;
  }>(answer.value);

  const classes = useStyles();

  const valueFieldId = `${proposalQuestionId}.value`;
  const unitFieldId = `${proposalQuestionId}.unit`;

  const getNumberOrDefault = (
    input: any,
    defaultValue: AcceptableUserInput
  ) => {
    const maybeNumber = parseFloat(input);

    return isNaN(maybeNumber) && input !== '' ? defaultValue : maybeNumber;
  };

  const getUnits = () => {
    if (config.units?.length === 0) {
      return null;
    } else if (config.units?.length === 1) {
      return <span className={`${classes.singleUnit}`}>{stateValue.unit}</span>;
    } else {
      return (
        <Select
          label="Unit"
          value={stateValue.unit}
          onChange={e => {
            const newState = { ...stateValue, unit: e.target.value as string };
            setStateValue(newState);
            onComplete(newState);
          }}
          name={unitFieldId}
          data-cy={unitFieldId}
        >
          {config.units!.map(unit => (
            <MenuItem value={unit} key={unit}>
              {unit}
            </MenuItem>
          ))}
        </Select>
      );
    }
  };

  return (
    <FormControl error={isError} required={config.required ? true : false}>
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          <FormLabel className={classes.label}>{question}</FormLabel>
          {config.small_label ? (
            <div className={classes.smallLabel}>{config.small_label}</div>
          ) : null}
        </Grid>
        <Grid item xs={3} className={classes.unitField}>
          <TextField
            label="Value"
            onChange={e =>
              setStateValue({
                ...stateValue,
                value: getNumberOrDefault(e.target.value, stateValue.value),
              })
            }
            onBlur={e => onComplete(stateValue)}
            value={stateValue.value}
            data-cy={valueFieldId}
            type="number"
            name={valueFieldId}
          />
        </Grid>
        <Grid item xs={6} className={classes.unitField}>
          {getUnits()}
        </Grid>

        <Grid item xs={6}>
          {isError && (
            <ProposalErrorLabel>{fieldError.value}</ProposalErrorLabel>
          )}
        </Grid>
        <Grid item xs={6}>
          {isError && (
            <ProposalErrorLabel>{fieldError.unit}</ProposalErrorLabel>
          )}
        </Grid>
      </Grid>
    </FormControl>
  );
}
