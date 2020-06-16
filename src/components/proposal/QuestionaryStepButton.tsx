import { makeStyles, StepButton } from '@material-ui/core';
import React, { PropsWithChildren } from 'react';

export function QuestionaryStepButton(
  props: PropsWithChildren<{
    onClick: () => Promise<void>;
    active?: boolean;
    completed?: boolean;
    clickable?: boolean;
    editable: boolean;
  }>
) {
  const classes = makeStyles(theme => ({
    active: {
      '& SVG': {
        color: theme.palette.secondary.main + '!important',
      },
    },
    editable: {
      '& SVG': {
        color: theme.palette.primary.main + '!important',
      },
    },
  }))();

  // NOTE: Exluding editable because it fires console warning when passed to StepButton component.
  const { editable, ...propsWithoutEditable } = props;

  const buttonClasses = [];

  if (propsWithoutEditable.active) {
    buttonClasses.push(classes.active);
  } else if (editable) {
    buttonClasses.push(classes.editable);
  }

  return (
    <StepButton {...propsWithoutEditable} className={buttonClasses.join(' ')}>
      {props.children}
    </StepButton>
  );
}
