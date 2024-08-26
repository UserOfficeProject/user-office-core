import { DialogContent } from '@mui/material';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { Form, Formik } from 'formik';
import React, { ChangeEvent, useState } from 'react';

import StyledDialog from 'components/common/StyledDialog';
import { InstrumentWithAvailabilityTime } from 'generated/sdk';
import { getMax32BitInteger } from 'utils/helperFunctions';
import useDataApiWithFeedback from 'utils/useDataApiWithFeedback';

const MAX_32_BIT_INTEGER = getMax32BitInteger();

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
      },
    }}
    required
    sx={{ width }}
    margin="none"
    placeholder="Enter in Days"
  />
);

const FapUpdateInstrumentTime = (props: FapUpdateInstrumentTimeProps) => {
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
    <StyledDialog
      open={true}
      onClose={props.close}
      title={`Update ${props.instrument.name} Availability Time`}
      fullWidth
      maxWidth="xs"
    >
      <DialogContent dividers>
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
                sx={(theme) => ({
                  margin: theme.spacing(3, 0, 2),
                  width,
                })}
                data-cy="submit-update-time"
              >
                Update
              </Button>
            </Grid>
          </Form>
        </Formik>
      </DialogContent>
    </StyledDialog>
  );
};

export default FapUpdateInstrumentTime;
