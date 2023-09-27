import StepButton from '@mui/material/StepButton';
import makeStyles from '@mui/styles/makeStyles';
import React, { PropsWithChildren } from 'react';

const useStyles = makeStyles((theme) => ({
  active: {
    '& SVG': {
      color: theme.palette.secondary.main + '!important',
    },
    '& .MuiStepIcon-text': {
      fill: theme.palette.secondary.contrastText,
    },
  },
  editable: {
    '& SVG': {
      color: theme.palette.primary.main + '!important',
    },
    '& .MuiStepIcon-text': {
      fill: theme.palette.primary.contrastText,
    },
  },
}));

export function QuestionaryStepButton(
  props: PropsWithChildren<{
    onClick: () => Promise<void>;
    active?: boolean;
    clickable?: boolean;
    readonly: boolean;
  }>
) {
  const classes = useStyles();

  // NOTE: Exluding readonly because it fires console warning when passed to StepButton component.
  const { readonly, ...propsWithoutReadonly } = props;

  const buttonClasses = [];

  if (propsWithoutReadonly.active) {
    buttonClasses.push(classes.active);
  } else if (!readonly) {
    buttonClasses.push(classes.editable);
  }

  return (
    <StepButton {...propsWithoutReadonly} className={buttonClasses.join(' ')}>
      {props.children}
    </StepButton>
  );
}
