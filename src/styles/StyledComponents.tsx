import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import styled from '@material-ui/core/styles/styled';
import React from 'react';

import { getTheme } from '../theme';

const getSpacing = (
  userValue: [number, number, number, number],
  defaultValue: [number, number?, number?, number?]
): string => {
  // eslint-disable-next-line prefer-spread
  return getTheme().spacing.apply(getTheme(), userValue || defaultValue);
};

export const StyledPaper = styled(({ ...other }) => <Paper {...other} />)({
  margin: (props: any) => getSpacing(props.margin, [3, 0]),
  padding: (props) => getSpacing(props.padding, [2]),
  [getTheme().breakpoints.up(600 + getTheme().spacing(3) * 2)]: {
    margin: (props) => getSpacing(props.margin, [6, 0]),
    padding: (props) => getSpacing(props.padding, [3]),
  },
});

export const FormWrapper = styled(({ ...other }) => <Box {...other} />)({
  margin: (props: any) => getSpacing(props.margin, [8]),
  display: (props) => props.display || 'flex',
  flexDirection: (props) => props.flexDirection || 'column',
  alignItems: (props) => props.alignItems || 'center',
  overflow: (props) => props.overflow || 'auto',
});

export const ContentContainer = styled(({ ...other }) => (
  <Container maxWidth="lg" {...other} />
))({
  padding: (props: any) => getSpacing(props.padding, [4, 0]),
});

export const ButtonContainer = styled(({ ...other }) => <div {...other} />)({
  display: 'flex',
  justifyContent: 'flex-end',
});
