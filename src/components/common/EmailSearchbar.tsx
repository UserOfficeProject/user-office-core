import { MTableToolbar } from '@material-table/core';
import { Button, makeStyles } from '@material-ui/core';
import { Form, Field } from 'formik';
import { TextField } from 'formik-material-ui';
import React from 'react';

// This component is used to retrieve a user from the database using an email.

const useStyles = makeStyles({
  titleStyle: {
    display: 'inline',
  },
  inviteButton: {
    marginLeft: '10px',
    whiteSpace: 'nowrap',
  },
  email: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'baseline',
  },
});

const EmailSearchbar: React.FC = (props) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.titleStyle}>
        <MTableToolbar {...props} />
      </div>
      <div>
        <Form className={useStyles().email}>
          <Field
            name="email"
            label="E-mail"
            id="Email-input"
            type="email"
            component={TextField}
            margin="normal"
            fullWidth
            flex="1"
            data-cy="email"
          />
          <Button
            data-cy="findUser"
            variant="contained"
            color="primary"
            type="submit"
            className={useStyles().inviteButton}
          >
            Find User
          </Button>
        </Form>
      </div>
    </>
  );
};

export default EmailSearchbar;
