import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import React from 'react';

function DateSearchCriteriaInput() {
  const theme = useTheme();

  return (
    <Grid container spacing={2} alignItems="end">
      <Grid item xs={6}>
        <FormControl fullWidth>
          <span style={{ marginTop: theme.spacing(2), display: 'block' }}>
            Search not implemented for this question type.
          </span>
        </FormControl>
      </Grid>
    </Grid>
  );
}

export default DateSearchCriteriaInput;
