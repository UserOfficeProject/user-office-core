import { Grid, Button, makeStyles } from '@material-ui/core';
import React from 'react';

import {
  ContentContainer,
  StyledPaper,
  ButtonContainer,
} from '../../styles/StyledComponents';
import SEPsTableOfficer from './SEPsTableOfficer';

const useStyles = makeStyles({
  button: {
    marginTop: '25px',
    marginLeft: '10px',
  },
});

const SEPsPage: React.FC = () => {
  const classes = useStyles();

  return (
    <ContentContainer>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <StyledPaper>
            <SEPsTableOfficer />
            <ButtonContainer>
              <Button
                type="button"
                variant="contained"
                color="primary"
                className={classes.button}
              >
                Create SEP
              </Button>
            </ButtonContainer>
          </StyledPaper>
        </Grid>
      </Grid>
    </ContentContainer>
  );
};

export default SEPsPage;
