import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';

export default function ProposalInformation(props) {
  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        General Information
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            id="title"
            name="title"
            label="Title"
            fullWidth
            onChange={(e) => props.onChange("title", e.target.value )}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            id="abstract"
            name="abstract"
            label="Abstract"
            fullWidth
            onChange={(e) => props.onChange("abstract", e.target.value )}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}