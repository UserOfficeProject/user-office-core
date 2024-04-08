// import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import React, { ChangeEvent, useState } from 'react';

import { InstrumentWithAvailabilityTime } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  cardHeader: {
    fontSize: '18px',
    padding: '22px 0 0',
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const MAX_32_BIT_INTEGER = Math.pow(2, 31);

type FapUpdateInstrumentTimeProps = {
  close: (newTime: number, instrumentId: number) => void;
  callId: number;
  instrument: InstrumentWithAvailabilityTime;
};

const AvailabilityTimeEditComponent = (
  instTime: string | undefined,
  onChange: (newTime: string) => void
) => (
  <TextField
    type="number"
    data-cy="availability-time"
    value={instTime}
    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
    InputProps={{ inputProps: { max: MAX_32_BIT_INTEGER - 1, min: 0 } }}
    required
    fullWidth
    margin="none"
  />
);

const FapUpdateInstrumentTime = (props: FapUpdateInstrumentTimeProps) => {
  const classes = useStyles();
  const { api } = useDataApiWithFeedback();
  const [newTime, SetNewTime] = useState<string | undefined>(
    props.instrument.availabilityTime?.toString()
  );

  const updateTimeAvailable = () => {
    newTime &&
      api({
        toastSuccessMessage: 'Availability time updated successfully!',
      }).setInstrumentAvailabilityTime({
        callId: props.callId,
        instrumentId: props.instrument.id,
        availabilityTime: +newTime,
      });
  };

  return (
    <Container component="main" maxWidth="sm">
      <Formik
        initialValues={{}}
        onSubmit={() => {
          updateTimeAvailable();
          props.close(+(newTime as string), props.instrument.id);
        }}
      >
        <Form>
          <Typography
            variant="h6"
            component="h1"
            className={classes.cardHeader}
          >
            Update {props.instrument.name} Avalibabity Time
          </Typography>
          {AvailabilityTimeEditComponent(newTime, SetNewTime)}
          <Button
            type="submit"
            className={classes.submit}
            data-cy="submit-update-time"
            fullWidth={true}
          >
            Update
          </Button>
        </Form>
      </Formik>
    </Container>
  );
};

export default FapUpdateInstrumentTime;
