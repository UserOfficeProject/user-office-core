import Box, { BoxProps } from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import React from 'react';

type TitledContainerProps = {
  children: NonNullable<React.ReactNode>;
  label?: string;
} & BoxProps;

const TitledContainer = (props: TitledContainerProps) => {
  const { children, label, ...rest } = props;

  return (
    <Box sx={{ marginTop: '35px', position: 'relative' }} {...rest}>
      <Typography
        variant="h6"
        component="h2"
        sx={(theme) => ({
          top: '-15px',
          left: '10px',
          position: 'absolute',
          marginBottom: '-15px',
          background: '#FFF',
          zIndex: 1,
          padding: '0 8px',
          color: theme.palette.grey[600],
        })}
      >
        {label}
      </Typography>
      <Container
        sx={{
          border: '1px solid #ccc',
          borderRadius: '5px',
          paddingTop: '26px',
          padding: '16px',
          zIndex: 0,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default TitledContainer;
