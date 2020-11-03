import { Grid, MenuItem, Select, TextField } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { getIn } from 'formik';
import React, { useEffect, useState } from 'react';

import { BasicComponentProps } from 'components/proposal/IBasicComponentProps';
import ProposalErrorLabel from 'components/proposal/ProposalErrorLabel';
import { IntervalConfig } from 'generated/sdk';

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

export function QuestionaryComponentInterval(props: BasicComponentProps) {
  const { answer, errors, onComplete, touched } = props;
  const {
    question: { proposalQuestionId, question },
  } = answer;
  const config = answer.config as IntervalConfig;
  const fieldError = getIn(errors, proposalQuestionId);
  const isError = getIn(touched, proposalQuestionId) && !!fieldError;
  const [stateValue, setStateValue] = useState<{
    min: AcceptableUserInput;
    max: AcceptableUserInput;
    unit: string;
  }>(answer.value);

  useEffect(() => {
    setStateValue(answer.value || false);
  }, [answer]);

  const classes = useStyles();

  const minFieldId = `${proposalQuestionId}.min`;
  const maxFieldId = `${proposalQuestionId}.max`;
  const unitFieldId = `${proposalQuestionId}.unit`;

  const getNumberOrDefault = (
    input: any,
    defaultValue: AcceptableUserInput
  ) => {
    const maybeNumber = parseFloat(input);

    return isNaN(maybeNumber) ? defaultValue : maybeNumber;
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
            setStateValue({ ...stateValue, unit: e.target.value as string });
            onComplete(e, stateValue);
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
    <FormControl error={isError}>
      <Grid container className={classes.container}>
        <Grid item xs={12}>
          {question}
          {config.small_label ? (
            <div className={classes.smallLabel}>{config.small_label}</div>
          ) : null}
        </Grid>
        <Grid item xs={3} className={classes.unitField}>
          <TextField
            label="Min"
            onChange={e =>
              setStateValue({
                ...stateValue,
                min: getNumberOrDefault(e.target.value, stateValue.min),
              })
            }
            onBlur={e => onComplete(e, stateValue)}
            value={stateValue.min}
            data-cy={minFieldId}
            type="number"
            name={minFieldId}
          />
        </Grid>

        <Grid item xs={3} className={classes.unitField}>
          <TextField
            label="Max"
            onChange={e =>
              setStateValue({
                ...stateValue,
                max: getNumberOrDefault(e.target.value, stateValue.max),
              })
            }
            onBlur={e => onComplete(e, stateValue)}
            value={stateValue.max}
            data-cy={maxFieldId}
            type="number"
            name={maxFieldId}
          />
        </Grid>
        <Grid item xs={6} className={classes.unitField}>
          {getUnits()}
        </Grid>

        <Grid item xs={3}>
          {isError && (
            <ProposalErrorLabel>
              {errors[proposalQuestionId].min}
            </ProposalErrorLabel>
          )}
        </Grid>
        <Grid item xs={3}>
          {isError && (
            <ProposalErrorLabel>
              {errors[proposalQuestionId].max}
            </ProposalErrorLabel>
          )}
        </Grid>
        <Grid item xs={6}>
          {isError && (
            <ProposalErrorLabel>
              {errors[proposalQuestionId].unit}
            </ProposalErrorLabel>
          )}
        </Grid>
      </Grid>
    </FormControl>
  );
}
