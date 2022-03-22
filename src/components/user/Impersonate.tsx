import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';

import { UserContext } from 'context/UserContextProvider';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

export function Impersonate(props: { id: number }) {
  const { api } = useDataApiWithFeedback();
  const { handleLogin } = useContext(UserContext);
  const history = useHistory();
  const classes = useStyles();

  return (
    <React.Fragment>
      <Typography variant="h6" component="h2" gutterBottom>
        Impersonate
      </Typography>
      <div className={classes.buttons}>
        <Button
          onClick={() =>
            api()
              .getTokenForUser({ userId: props.id })
              .then((data) => {
                const { token, rejection } = data.getTokenForUser;
                if (!rejection) {
                  handleLogin(token);
                  history.push('/home');
                }
              })
          }
        >
          Connect as this user...
        </Button>
      </div>
    </React.Fragment>
  );
}
