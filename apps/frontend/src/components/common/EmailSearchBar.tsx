import { MTableToolbar, Options } from '@material-table/core';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Form, Field } from 'formik';
import React from 'react';

import TextField from './FormikUITextField';

// This component is used to retrieve a user from the database using an email.
const EmailSearchBar = (props: Options<JSX.Element>) => (
  <>
    <Box
      sx={{
        display: 'inline',
      }}
    >
      <MTableToolbar {...props} />
    </Box>
    <div>
      <Form>
        <Box display="flex" justifyContent="flex-end" alignItems="baseline">
          <Field
            name="email"
            label="E-mail"
            id="Email-input"
            type="email"
            component={TextField}
            fullWidth
            flex="1"
            data-cy="email"
          />
          <Button
            data-cy="findUser"
            type="submit"
            sx={{ marginLeft: '10px', whiteSpace: 'nowrap' }}
          >
            Find User
          </Button>
        </Box>
      </Form>
    </div>
  </>
);

export default EmailSearchBar;
