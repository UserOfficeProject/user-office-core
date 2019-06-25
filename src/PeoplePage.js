import React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import PeopleTable from './PeopleTable';
import UserPage from './UserPage'


const useStyles = makeStyles(theme => ({
    container: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
    },
    paper: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(600 + theme.spacing(3) * 2)]: {
          marginTop: theme.spacing(6),
          marginBottom: theme.spacing(6),
          padding: theme.spacing(3),
        },
      },
    fixedHeight: {
      height: 240,
    },
  }));


export default function PeoplePage({match}) {
    const classes = useStyles();
    return (<React.Fragment>
        <Container maxWidth="lg" className={classes.container}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper className={classes.paper}>
                {match.params.userID ? <UserPage id={match.params.userID} /> : <PeopleTable />}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      </React.Fragment>
)};