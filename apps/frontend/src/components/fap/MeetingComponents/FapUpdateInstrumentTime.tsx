import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import makeStyles from '@mui/styles/makeStyles';
import { Form, Formik } from 'formik';
import React, { ChangeEvent, useState } from 'react';

import { InstrumentWithAvailabilityTime } from 'generated/sdk';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const MAX_32_BIT_INTEGER = Math.pow(2, 31);

const width = '95%';

type FapUpdateInstrumentTimeProps = {
  close: () => void;
  updateTime: (newTime: number, instrumentId: number) => void;
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
    InputProps={{
      inputProps: {
        max: MAX_32_BIT_INTEGER - 1,
        min: 0,
        style: { textAlign: 'center' },
      },
    }}
    required
    sx={{ width }}
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
    <Dialog open={true} onClose={props.close}>
      <DialogTitle variant="h6" component="h2">
        Update {props.instrument.name} Availability Time
      </DialogTitle>
      <Formik
        initialValues={{}}
        onSubmit={() => {
          updateTimeAvailable();
          props.updateTime(+(newTime as string), props.instrument.id);
        }}
      >
        <Form style={{ padding: '10px', alignContent: 'center' }}>
          <Grid
            direction="column"
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {AvailabilityTimeEditComponent(newTime, SetNewTime)}
            <Button
              type="submit"
              className={classes.submit}
              data-cy="submit-update-time"
              sx={{ width }}
            >
              Update
            </Button>
          </Grid>
        </Form>
      </Formik>
    </Dialog>
  );
};

export default FapUpdateInstrumentTime;
