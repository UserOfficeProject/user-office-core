import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles';
import styled from '@material-ui/core/styles/styled';
import { CSSProperties } from '@material-ui/styles';
import React from 'react';

export const StyledPaper = styled(({ ...other }) => <Paper {...other} />)(
  ({ theme, ...props }: { theme: Theme } & CSSProperties) => ({
    margin: props.margin || theme.spacing(3, 0),
    padding: props.padding || theme.spacing(2),
    [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
      margin: props.margin || theme.spacing(6, 0),
      padding: props.padding || theme.spacing(3),
    },
  })
);
export const FormWrapper = styled(({ ...other }) => <Box {...other} />)(
  ({ theme, ...props }: { theme: Theme } & CSSProperties) => ({
    margin: props.margin || theme.spacing(8),
    display: props.display || 'flex',
    flexDirection: props.flexDirection || 'column',
    alignItems: props.alignItems || 'center',
    overflow: props.overflow || 'auto',
  })
);
export const ContentContainer = styled(({ maxWidth = false, ...other }) => (
  <Container maxWidth={maxWidth} {...other} />
))(({ theme, ...props }: { theme: Theme } & CSSProperties) => ({
  padding: props.padding || theme.spacing(2, 2),
}));
export const ButtonContainer = styled(({ ...other }) => <div {...other} />)({
  display: 'flex',
  justifyContent: 'flex-end',
});
